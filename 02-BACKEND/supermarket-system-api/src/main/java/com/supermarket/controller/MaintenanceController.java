package com.supermarket.controller;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.supermarket.config.BackupService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@Tag(name = "Mantenimiento", description = "Operaciones de respaldo y restauración del sistema")
public class MaintenanceController {

    private final BackupService backupService;

    @GetMapping("/backup")
    @Operation(summary = "Generar respaldo de la base de datos", description = "Descarga un archivo .sql con la estructura y datos actuales")
    @PreAuthorize("hasRole('ADMIN_INGENIERO')")
    public ResponseEntity<Resource> downloadBackup() {
        byte[] data = backupService.createBackup();
        ByteArrayResource resource = new ByteArrayResource(data);
        
        String fileName = "supermarket_backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".sql";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(data.length)
                .body(resource);
    }

    @PostMapping("/restore")
    @Operation(summary = "Restaurar base de datos", description = "Sube un archivo .sql para sobrescribir la base de datos actual")
    @PreAuthorize("hasRole('ADMIN_INGENIERO')")
    public ResponseEntity<String> restoreBackup(@RequestParam("file") MultipartFile file) {
        backupService.restoreBackup(file);
        return ResponseEntity.ok("Base de datos restaurada exitosamente");
    }
}
