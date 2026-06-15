package com.supermarket.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BackupService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    private record DbConnection(String host, int port, String database) {}

    private DbConnection parseJdbcUrl() {
        String withoutPrefix = dbUrl.replaceFirst("^jdbc:mysql://", "");
        int slashIdx = withoutPrefix.indexOf('/');
        String hostPort = slashIdx > 0 ? withoutPrefix.substring(0, slashIdx) : withoutPrefix;
        String dbPart = slashIdx > 0 ? withoutPrefix.substring(slashIdx + 1) : "";
        String database = dbPart.split("\\?")[0];

        String host;
        int port = 3306;
        if (hostPort.contains(":")) {
            String[] parts = hostPort.split(":", 2);
            host = parts[0];
            port = Integer.parseInt(parts[1]);
        } else {
            host = hostPort;
        }
        return new DbConnection(host, port, database);
    }

    private List<String> mysqlBaseArgs(DbConnection conn) {
        List<String> args = new ArrayList<>();
        args.add("-h");
        args.add(conn.host());
        args.add("-P");
        args.add(String.valueOf(conn.port()));
        args.add("-u");
        args.add(dbUsername);
        args.add("-p" + dbPassword);
        args.add("--ssl-mode=DISABLED");
        return args;
    }

    private String readProcessError(Process process) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
            StringBuilder error = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                error.append(line).append('\n');
            }
            return error.toString().trim();
        } catch (IOException ex) {
            return ex.getMessage();
        }
    }

    public byte[] createBackup() {
        DbConnection conn = parseJdbcUrl();
        Path tempFile;
        try {
            tempFile = Files.createTempFile("backup-", ".sql");
        } catch (IOException ex) {
            throw ioError("crear archivo temporal", ex);
        }

        List<String> command = new ArrayList<>();
        command.add("mysqldump");
        command.addAll(mysqlBaseArgs(conn));
        command.add("--single-transaction");
        command.add("--routines");
        command.add("--triggers");
        command.add("--databases");
        command.add(conn.database());
        command.add("--result-file=" + tempFile.toAbsolutePath());

        runCommand(command, "crear respaldo");

        try {
            byte[] data = Files.readAllBytes(tempFile);
            if (data.length == 0) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "El respaldo generado está vacío");
            }
            return data;
        } catch (IOException ex) {
            throw ioError("leer respaldo", ex);
        } finally {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException ex) {
                log.warn("No se pudo eliminar archivo temporal de respaldo: {}", ex.getMessage());
            }
        }
    }

    public void restoreBackup(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Debe enviar un archivo SQL válido");
        }

        DbConnection conn = parseJdbcUrl();
        Path tempFile;
        try {
            tempFile = Files.createTempFile("restore-", ".sql");
            file.transferTo(tempFile);
        } catch (IOException ex) {
            throw ioError("guardar archivo de restauración", ex);
        }

        try {
            List<String> command = new ArrayList<>();
            command.add("mysql");
            command.addAll(mysqlBaseArgs(conn));

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectInput(tempFile.toFile());
            pb.redirectErrorStream(false);
            runProcess(pb, "restaurar respaldo");
        } finally {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException ex) {
                log.warn("No se pudo eliminar archivo temporal de restauración: {}", ex.getMessage());
            }
        }
    }

    private ResponseStatusException ioError(String action, IOException ex) {
        log.error("Error de E/S al {}: {}", action, ex.getMessage());
        return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al " + action + ": " + ex.getMessage());
    }

    private void runCommand(List<String> command, String action) {
        runProcess(new ProcessBuilder(command), action);
    }

    private void runProcess(ProcessBuilder pb, String action) {
        Process process;
        try {
            process = pb.start();
        } catch (IOException ex) {
            log.error("Cliente MySQL no disponible al {}: {}", action, ex.getMessage());
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "El servidor no tiene instalado el cliente MySQL (mysqldump/mysql). Contacte al administrador.");
        }

        int exitCode;
        try {
            exitCode = process.waitFor();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Operación de respaldo interrumpida");
        }
        if (exitCode != 0) {
            String error = readProcessError(process);
            log.error("Error al {}: {}", action, error);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al " + action + (error.isBlank() ? "" : ": " + error));
        }
    }
}
