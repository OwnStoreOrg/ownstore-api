import { PrimaryGeneratedColumn, Column, ManyToOne, Entity, OneToOne } from 'typeorm'

@Entity()
export default class Image {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'mediumtext', name: 'url' })
  url: string

  @Column({ type: 'varchar', name: 'thirdPartyId', nullable: true })
  thirdPartyId: string | null

  @Column({ type: 'varchar', name: 'originalName', nullable: true })
  originalName: string | null

  @Column({ type: 'varchar', name: 'sizeInBytes', nullable: true })
  sizeInBytes: string | null

  @Column({ type: 'varchar', name: 'width', nullable: true })
  width: number | null

  @Column({ type: 'varchar', name: 'height', nullable: true })
  height: number | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
