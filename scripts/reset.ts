/**
 * Database reset — drops all data, then re-seeds.
 * Prompts for "RESET" confirmation in interactive mode.
 *
 * Usage:  npm run db:reset
 */

import dotenv          from 'dotenv'
import path            from 'path'
import mongoose        from 'mongoose'
import { execSync }    from 'child_process'
import * as readline   from 'readline'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) { console.error('\n🚨  MONGODB_URI not set.\n'); process.exit(1) }

const COLLECTIONS = ['users', 'applications', 'faculties', 'news', 'announcements', 'contacts']

async function confirm(): Promise<void> {
  if (!process.stdin.isTTY) return   // non-interactive (CI) — skip prompt
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question('\n⚠️   Type "RESET" to confirm database wipe: ', answer => {
      rl.close()
      answer.trim() === 'RESET' ? resolve() : reject(new Error('Reset cancelled'))
    })
  })
}

async function reset() {
  await confirm()
  await mongoose.connect(MONGODB_URI!, { serverSelectionTimeoutMS: 10_000 })
  console.log('\n   ✅  Connected')

  for (const col of COLLECTIONS) {
    try {
      await mongoose.connection.db!.collection(col).deleteMany({})
      console.log(`   🗑️   Cleared: ${col}`)
    } catch { /* collection may not exist */ }
  }

  await mongoose.disconnect()
  console.log('\n   ✅  Reset complete. Running seed…\n')
  execSync('npm run seed', { stdio: 'inherit' })
}

reset().catch(err => { console.error('\n💥  Reset failed:', err.message); process.exit(1) })
