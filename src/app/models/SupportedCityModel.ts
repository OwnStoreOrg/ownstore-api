import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class SupportedCity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string

  @Column({ type: 'varchar', name: 'threeLetterName', unique: true })
  threeLetterName: string

  @Column({ type: 'varchar', name: 'flagUrl', nullable: true })
  flagUrl: string | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
