<?php

namespace App\DataFixtures;

use App\Entity\Rol;
use App\Entity\Usuario;
use App\Entity\Grupo;
use App\Entity\Membresia;
use App\Entity\Mensaje;
use App\Entity\Bot;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // 1. Crear roles
        $rolAdmin = new Rol();
        $rolAdmin->setId(1);
        $rolAdmin->setNombre('admin');
        $manager->persist($rolAdmin);

        $rolUsuario = new Rol();
        $rolUsuario->setId(2);
        $rolUsuario->setNombre('usuario');
        $manager->persist($rolUsuario);

        $rolModerador = new Rol();
        $rolModerador->setId(3);
        $rolModerador->setNombre('moderador');
        $manager->persist($rolModerador);

        // 2. Crear usuarios
        // Usuario administrador
        $admin = new Usuario();
        $admin->setUsername('admin');
        $admin->setEmail('admin@agora.com');
        $admin->setPasswordHash($this->passwordHasher->hashPassword($admin, 'admin123'));
        $admin->setNombre('Administrador');
        $admin->setRol($rolAdmin);
        $admin->setActivo(true);
        $manager->persist($admin);

        // Usuario moderador
        $moderador = new Usuario();
        $moderador->setUsername('moderador');
        $moderador->setEmail('mod@agora.com');
        $moderador->setPasswordHash($this->passwordHasher->hashPassword($moderador, 'mod123'));
        $moderador->setNombre('Moderador Principal');
        $moderador->setRol($rolModerador);
        $moderador->setActivo(true);
        $manager->persist($moderador);

        // Usuarios de prueba
        $usuarios = [];
        $nombresUsuarios = [
            ['luis', 'luis@agora.com', 'Luis Ángel'],
            ['maria', 'maria@agora.com', 'María García'],
            ['carlos', 'carlos@agora.com', 'Carlos López'],
            ['ana', 'ana@agora.com', 'Ana Martínez'],
            ['pedro', 'pedro@agora.com', 'Pedro Sánchez']
        ];

        foreach ($nombresUsuarios as [$username, $email, $nombre]) {
            $usuario = new Usuario();
            $usuario->setUsername($username);
            $usuario->setEmail($email);
            $usuario->setPasswordHash($this->passwordHasher->hashPassword($usuario, '123456'));
            $usuario->setNombre($nombre);
            $usuario->setRol($rolUsuario);
            $usuario->setActivo(true);
            $manager->persist($usuario);
            $usuarios[] = $usuario;
        }

        // 3. Crear grupos
        $gruposData = [
            [
                'nombre' => 'Desarrollo Web',
                'descripcion' => 'Conversaciones sobre programación web, frameworks y tecnologías modernas',
                'privado' => false
            ],
            [
                'nombre' => 'Gaming Zone',
                'descripcion' => 'Todo sobre videojuegos, reviews, tips y competiciones',
                'privado' => false
            ],
            [
                'nombre' => 'Música y Arte',
                'descripcion' => 'Comparte tu música favorita, arte y creatividad',
                'privado' => false
            ],
            [
                'nombre' => 'Proyecto TFG',
                'descripcion' => 'Grupo privado para coordinación del proyecto',
                'privado' => true
            ]
        ];

        $grupos = [];
        foreach ($gruposData as $grupoData) {
            $grupo = new Grupo();
            $grupo->setNombre($grupoData['nombre']);
            $grupo->setDescripcion($grupoData['descripcion']);
            $grupo->setCreadoPor($admin);
            $grupo->setPrivado($grupoData['privado']);
            $manager->persist($grupo);
            $grupos[] = $grupo;

            // Agregar admin como miembro de todos los grupos
            $membresia = new Membresia();
            $membresia->setGrupo($grupo);
            $membresia->setUsuario($admin);
            $membresia->setRolEnGrupo('creador');
            $manager->persist($membresia);
        }

        // 4. Agregar usuarios a grupos (excepto el privado)
        foreach ($usuarios as $index => $usuario) {
            for ($i = 0; $i < 3; $i++) { // Solo los 3 primeros grupos (no el privado)
                if ($index % 2 == $i % 2) { // Distribuir usuarios de forma variada
                    $membresia = new Membresia();
                    $membresia->setGrupo($grupos[$i]);
                    $membresia->setUsuario($usuario);
                    $membresia->setRolEnGrupo('miembro');
                    $manager->persist($membresia);
                }
            }
        }

        // Agregar moderador a grupos
        for ($i = 0; $i < 3; $i++) {
            $membresia = new Membresia();
            $membresia->setGrupo($grupos[$i]);
            $membresia->setUsuario($moderador);
            $membresia->setRolEnGrupo('moderador');
            $manager->persist($membresia);
        }

        // 5. Crear mensajes de bienvenida
        $mensajesData = [
            // Desarrollo Web
            [$grupos[0], $admin, '¡Bienvenidos al grupo de Desarrollo Web! 🚀'],
            [$grupos[0], $moderador, 'Aquí pueden compartir recursos, hacer preguntas y ayudarse mutuamente'],
            [$grupos[0], $usuarios[0], '¡Hola a todos! Estoy aprendiendo React, ¿algún consejo?'],
            [$grupos[0], $usuarios[1], 'Te recomiendo empezar con los hooks, son muy útiles 👍'],
            
            // Gaming Zone  
            [$grupos[1], $admin, '¡Bienvenidos gamers! 🎮 ¿Qué están jugando últimamente?'],
            [$grupos[1], $usuarios[2], 'Acabo de terminar Elden Ring, ¡qué juegazo!'],
            [$grupos[1], $usuarios[3], '¿Alguien juega multiplayer? Podríamos hacer un equipo'],
            
            // Música y Arte
            [$grupos[2], $admin, 'Espacio para compartir arte, música y creatividad 🎨🎵'],
            [$grupos[2], $usuarios[4], 'Acabo de descubrir un artista increíble, ¿conocen a...?'],
            [$grupos[2], $moderador, 'Recuerden respetar los derechos de autor al compartir'],
            
            // Proyecto TFG (privado)
            [$grupos[3], $admin, 'Grupo para coordinación del desarrollo de Ágora'],
        ];

        foreach ($mensajesData as [$grupo, $usuario, $contenido]) {
            $mensaje = new Mensaje();
            $mensaje->setGrupo($grupo);
            $mensaje->setUsuario($usuario);
            $mensaje->setContenido($contenido);
            $mensaje->setCreadoAt(new \DateTime('-' . rand(1, 30) . ' minutes')); // Mensajes de los últimos 30 min
            $manager->persist($mensaje);
        }

        // 6. Crear bots
        $botAsistente = new Bot();
        $botAsistente->setNombre('AgoraBot');
        $botAsistente->setTipo('script');
        $botAsistente->setConfig([
            'respuestas' => [
                'hola' => '¡Hola! 👋 Soy AgoraBot, tu asistente virtual',
                'ayuda' => 'Puedo ayudarte con información sobre Ágora. Escribe "comandos" para ver qué puedo hacer',
                'comandos' => 'Comandos disponibles: /tiempo, /usuarios, /grupos, /ayuda'
            ],
            'activo_en_grupos' => [1, 2, 3]
        ]);
        $botAsistente->setActivo(true);
        $manager->persist($botAsistente);

        $botNoticiasWeb = new Bot();
        $botNoticiasWeb->setNombre('WebNewsBot');
        $botNoticiasWeb->setTipo('script');
        $botNoticiasWeb->setConfig([
            'categoria' => 'desarrollo_web',
            'frecuencia' => 'diaria',
            'activo_en_grupos' => [1]
        ]);
        $botNoticiasWeb->setActivo(true);
        $manager->persist($botNoticiasWeb);

        // Ejecutar todas las inserciones
        $manager->flush();
    }
}
