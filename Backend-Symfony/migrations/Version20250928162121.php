<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250928162121 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE archivos (id INT AUTO_INCREMENT NOT NULL, mensaje_id BIGINT NOT NULL, nombre_original VARCHAR(255) DEFAULT NULL, ruta VARCHAR(500) DEFAULT NULL, tam INT DEFAULT NULL, creado_at DATETIME NOT NULL, INDEX IDX_188D04B34C54F362 (mensaje_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE bots (id INT AUTO_INCREMENT NOT NULL, nombre VARCHAR(100) DEFAULT NULL, tipo VARCHAR(50) DEFAULT NULL, config JSON DEFAULT NULL, activo TINYINT(1) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE conversaciones (id INT AUTO_INCREMENT NOT NULL, tipo VARCHAR(255) NOT NULL, creado_at DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE grupos (id INT AUTO_INCREMENT NOT NULL, creado_por_id INT NOT NULL, nombre VARCHAR(150) NOT NULL, descripcion LONGTEXT DEFAULT NULL, creado_at DATETIME NOT NULL, privado TINYINT(1) NOT NULL, INDEX IDX_45842FEFE35D8C4 (creado_por_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE membresias (id INT AUTO_INCREMENT NOT NULL, grupo_id INT NOT NULL, usuario_id INT NOT NULL, rol_en_grupo VARCHAR(30) NOT NULL, creado_at DATETIME NOT NULL, INDEX IDX_1AFE1AB19C833003 (grupo_id), INDEX IDX_1AFE1AB1DB38439E (usuario_id), UNIQUE INDEX UNIQ_1AFE1AB19C833003DB38439E (grupo_id, usuario_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE mensajes (id BIGINT AUTO_INCREMENT NOT NULL, conversacion_id INT DEFAULT NULL, grupo_id INT DEFAULT NULL, usuario_id INT NOT NULL, contenido LONGTEXT DEFAULT NULL, tipo VARCHAR(255) NOT NULL, creado_at DATETIME NOT NULL, eliminado TINYINT(1) NOT NULL, INDEX IDX_6C929C80ABD5A1D6 (conversacion_id), INDEX IDX_6C929C809C833003 (grupo_id), INDEX IDX_6C929C80DB38439E (usuario_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE roles (id INT NOT NULL, nombre VARCHAR(30) NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE usuarios (id INT AUTO_INCREMENT NOT NULL, rol_id INT NOT NULL, username VARCHAR(50) NOT NULL, email VARCHAR(120) NOT NULL, password_hash VARCHAR(255) NOT NULL, nombre VARCHAR(100) DEFAULT NULL, creado_at DATETIME NOT NULL, ultimo_login DATETIME DEFAULT NULL, activo TINYINT(1) NOT NULL, UNIQUE INDEX UNIQ_EF687F2F85E0677 (username), UNIQUE INDEX UNIQ_EF687F2E7927C74 (email), INDEX IDX_EF687F24BAB96C (rol_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE archivos ADD CONSTRAINT FK_188D04B34C54F362 FOREIGN KEY (mensaje_id) REFERENCES mensajes (id)');
        $this->addSql('ALTER TABLE grupos ADD CONSTRAINT FK_45842FEFE35D8C4 FOREIGN KEY (creado_por_id) REFERENCES usuarios (id)');
        $this->addSql('ALTER TABLE membresias ADD CONSTRAINT FK_1AFE1AB19C833003 FOREIGN KEY (grupo_id) REFERENCES grupos (id)');
        $this->addSql('ALTER TABLE membresias ADD CONSTRAINT FK_1AFE1AB1DB38439E FOREIGN KEY (usuario_id) REFERENCES usuarios (id)');
        $this->addSql('ALTER TABLE mensajes ADD CONSTRAINT FK_6C929C80ABD5A1D6 FOREIGN KEY (conversacion_id) REFERENCES conversaciones (id)');
        $this->addSql('ALTER TABLE mensajes ADD CONSTRAINT FK_6C929C809C833003 FOREIGN KEY (grupo_id) REFERENCES grupos (id)');
        $this->addSql('ALTER TABLE mensajes ADD CONSTRAINT FK_6C929C80DB38439E FOREIGN KEY (usuario_id) REFERENCES usuarios (id)');
        $this->addSql('ALTER TABLE usuarios ADD CONSTRAINT FK_EF687F24BAB96C FOREIGN KEY (rol_id) REFERENCES roles (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE archivos DROP FOREIGN KEY FK_188D04B34C54F362');
        $this->addSql('ALTER TABLE grupos DROP FOREIGN KEY FK_45842FEFE35D8C4');
        $this->addSql('ALTER TABLE membresias DROP FOREIGN KEY FK_1AFE1AB19C833003');
        $this->addSql('ALTER TABLE membresias DROP FOREIGN KEY FK_1AFE1AB1DB38439E');
        $this->addSql('ALTER TABLE mensajes DROP FOREIGN KEY FK_6C929C80ABD5A1D6');
        $this->addSql('ALTER TABLE mensajes DROP FOREIGN KEY FK_6C929C809C833003');
        $this->addSql('ALTER TABLE mensajes DROP FOREIGN KEY FK_6C929C80DB38439E');
        $this->addSql('ALTER TABLE usuarios DROP FOREIGN KEY FK_EF687F24BAB96C');
        $this->addSql('DROP TABLE archivos');
        $this->addSql('DROP TABLE bots');
        $this->addSql('DROP TABLE conversaciones');
        $this->addSql('DROP TABLE grupos');
        $this->addSql('DROP TABLE membresias');
        $this->addSql('DROP TABLE mensajes');
        $this->addSql('DROP TABLE roles');
        $this->addSql('DROP TABLE usuarios');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
