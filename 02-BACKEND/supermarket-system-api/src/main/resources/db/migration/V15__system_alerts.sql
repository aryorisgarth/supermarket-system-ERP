CREATE TABLE IF NOT EXISTS system_alerts (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    alert_key       VARCHAR(160)  NOT NULL,
    type            VARCHAR(40)   NOT NULL,
    severity        VARCHAR(20)   NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    title           VARCHAR(120)  NOT NULL,
    message         VARCHAR(500)  NOT NULL,
    source_module   VARCHAR(60),
    reference_id    BIGINT,
    action_path     VARCHAR(120),
    created_at      DATETIME      NOT NULL,
    updated_at      DATETIME      NOT NULL,
    resolved_at     DATETIME,
    resolved_by_id  BIGINT,
    PRIMARY KEY (id),
    CONSTRAINT uk_system_alerts_key UNIQUE (alert_key),
    CONSTRAINT fk_system_alerts_resolved_by FOREIGN KEY (resolved_by_id) REFERENCES users (id)
);

CREATE INDEX idx_system_alerts_status_severity ON system_alerts (status, severity);
CREATE INDEX idx_system_alerts_created_at ON system_alerts (created_at);
