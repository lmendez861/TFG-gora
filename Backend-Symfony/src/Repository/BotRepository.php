<?php

namespace App\Repository;

use App\Entity\Bot;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Bot>
 */
class BotRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Bot::class);
    }

    /**
     * Obtener bots activos
     */
    public function findActiveBots(): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.activo = :activo')
            ->setParameter('activo', true)
            ->getQuery()
            ->getResult();
    }

    /**
     * Obtener bots por tipo
     */
    public function findByType(string $tipo): array
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.tipo = :tipo')
            ->andWhere('b.activo = :activo')
            ->setParameter('tipo', $tipo)
            ->setParameter('activo', true)
            ->getQuery()
            ->getResult();
    }
}