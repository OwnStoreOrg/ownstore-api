import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class Currency {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string

  @Column({ type: 'varchar', name: 'isoCode', unique: true })
  isoCode: string

  @Column({ type: 'varchar', name: 'symbol', unique: true })
  symbol: string

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
