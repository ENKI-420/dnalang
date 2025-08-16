import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { readFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Read and execute schema creation script
    const schemaScript = await readFile(join(process.cwd(), "scripts", "01-create-dna-organism-tables.sql"), "utf-8")
    await sql(schemaScript)

    // Read and execute seed data script
    const seedScript = await readFile(join(process.cwd(), "scripts", "02-seed-initial-data.sql"), "utf-8")
    await sql(seedScript)

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[DB Setup] Failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database setup failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
