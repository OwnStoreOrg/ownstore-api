import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity()
export default class PageRefundPolicy {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'title' })
  title: string

  @Column({ type: 'longtext', name: 'body' })
  body: string

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
