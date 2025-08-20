import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id

    // Delete the message
    await prisma.message.delete({
      where: {
        id: messageId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
