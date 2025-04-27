import { readFileSync, readdirSync } from 'node:fs'
import pLimit from 'p-limit'
import { Record, RecordMetadataKey, exportJKF, exportJKFString, importKIF } from 'tsshogi'

/**
 * 棋譜をCMSに投稿
 * @param env
 */
const post_tsume = async (timestamp: string): Promise<void> => {
  try {
    const record: Record = get_everyday_tsume(timestamp)
    const encoder = new TextEncoder()
    const data = encoder.encode(exportJKFString(record))
    const buffer = await crypto.subtle.digest('SHA-256', data)
    const array = Array.from(new Uint8Array(buffer))
    const hash = array.map((byte) => byte.toString(16).padStart(2, '0')).join('')
    console.log(`Post ${hash} to ${process.env.CMS_SERVICE_HOST}`)
    const url: URL = new URL('/api/tsumes', process.env.CMS_SERVICE_HOST)
    const gameId: number = (() => {
      const opusNo: string | undefined = record.metadata.getStandardMetadata(RecordMetadataKey.OPUS_NO)
      return opusNo !== undefined ? Number.parseInt(opusNo, 10) : 0
    })()
    console.log(Record)
    const response = await fetch(url.href, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CMS_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        data: {
          uid: hash,
          title: record.metadata.getStandardMetadata(RecordMetadataKey.TITLE),
          author: record.metadata.getStandardMetadata(RecordMetadataKey.AUTHOR),
          source: record.metadata.getStandardMetadata(RecordMetadataKey.SOURCE),
          length: record.moves.length,
          gameId: gameId,
          data: exportJKF(record)
        }
      })
    })
    if (!response.ok) {
      console.error({
        status: response.status,
        statusText: response.statusText
      })
    }
  } catch (e) {
    console.error(timestamp, e)
  }
  return
}

const get_everyday_tsume = (timestamp: string): Record => {
  const text = readFileSync(`src/tsume/${timestamp}.txt`, 'utf-8')
  const record: Record | Error = importKIF(text)
  if (record instanceof Error) {
    console.error(text)
    throw new Error(`Invalid KIF format: ${record.message} ${timestamp}`)
  }
  // biome-ignore lint/complexity/noForEach: <explanation>
  record.moves.forEach((move) => move.setElapsedMs(0))
  record.metadata.setStandardMetadata(RecordMetadataKey.TITLE, `まいにち詰将棋(${timestamp})`)
  record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, '先手')
  record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, '後手')
  record.metadata.setStandardMetadata(RecordMetadataKey.SOURCE, 'まいにち詰将棋')
  record.metadata.setStandardMetadata(RecordMetadataKey.OPUS_NAME, 'まいにち詰将棋')
  record.metadata.setStandardMetadata(RecordMetadataKey.OPUS_NO, timestamp)
  console.log(`Get ${timestamp} from ${process.env.CMS_SERVICE_HOST}`)
  return record
}

const upload_everyday_tsume = async (): Promise<void> => {
  const days = readdirSync('src/tsume').map((file) => file.split('.').at(0) || '', 10)
  const limit = pLimit(5)
  await Promise.all(days.map((day) => limit(() => post_tsume(day))))
}

upload_everyday_tsume()
