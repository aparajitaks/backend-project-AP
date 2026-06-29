const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create a demo user
  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      password: hashedPassword,
      name: "Demo User",
    },
  });

  console.log(`✅ Created user: ${user.email} (id: ${user.id})`);

  // Create sample notes
  const sampleNotes = [
    {
      title: "Welcome to Personal Notes",
      content: "This is your first note. Start writing!",
      tags: ["welcome", "getting-started"],
      isPinned: true,
      userId: user.id,
    },
    {
      title: "Meeting Notes",
      content: "Discussed Q3 roadmap and milestones.",
      tags: ["work", "meetings"],
      isPinned: false,
      userId: user.id,
    },
    {
      title: "Grocery List",
      content: "Milk, eggs, bread, coffee, avocados.",
      tags: ["personal", "shopping"],
      isPinned: false,
      userId: user.id,
    },
  ];

  for (const note of sampleNotes) {
    const created = await prisma.note.create({ data: note });
    console.log(`  📝 Created note: "${created.title}"`);
  }

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
