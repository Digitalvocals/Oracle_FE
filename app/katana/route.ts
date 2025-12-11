import { redirect } from 'next/navigation'

export async function GET() {
  redirect('/?utm_source=katana&utm_medium=partner&utm_campaign=katana_discord')
}
