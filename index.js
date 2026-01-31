require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// IDLERİNİ BURAYA KOY
const STAFF_ROLE_ID = "1466974837757972511";
const CATEGORY_ID = "1466979086160105565"; // ticketlerin açılacağı kategori

client.once("ready", () => {
  console.log("Ticket bot hazır ✅");
});


// 📌 SETUP PANEL
client.on("messageCreate", async msg => {
  if (msg.author.bot) return;

  if (msg.content === "!setup") {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_menu")
      .setPlaceholder("Destek türü seç")
      .addOptions([
        { label: "Ağır Destek", value: "agir", description: "Büyük teknik sorunlar" },
        { label: "İşlemler", value: "islem", description: "Hesap / işlem işleri" },
        { label: "Şikayet", value: "sikayet", description: "Kullanıcı şikayetleri" },
        { label: "Yetkili Başvuru", value: "yetkili", description: "Yetkili olmak için" }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    msg.channel.send({
      content: "🎫 Destek almak için tür seç:",
      components: [row]
    });
  }
});


// 🎫 TICKET OLUŞTUR
client.on(Events.InteractionCreate, async interaction => {
  try {

    // DROPDOWN SEÇİMİ
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId !== "ticket_menu") return;

      const tip = interaction.values[0];
      const isim = `ticket-${tip}-${interaction.user.username}`;

      const kanal = await interaction.guild.channels.create({
        name: isim,
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          },
          {
            id: STAFF_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages
            ]
          }
        ]
      });

      const kapatBtn = new ButtonBuilder()
        .setCustomId("ticket_kapat")
        .setLabel("🔒 Ticket Kapat")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(kapatBtn);

      await kanal.send({
        content: `${interaction.user} destek ekibi yakında ilgilenecek.`,
        components: [row]
      });

      await interaction.reply({
        content: "Ticket açıldı ✅",
        ephemeral: true
      });
    }

    // 🔒 KAPAT BUTONU
    if (interaction.isButton()) {
      if (interaction.customId === "ticket_kapat") {
        await interaction.reply({ content: "Kapatılıyor...", ephemeral: true });
        setTimeout(() => interaction.channel.delete(), 2000);
      }
    }

  } catch (err) {
    console.log("HATA:", err);
  }
});

client.login(process.env.TOKEN);
