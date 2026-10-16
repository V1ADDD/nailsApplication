using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddChatsMedia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "chats");

            migrationBuilder.AddColumn<string>(
                name: "active_mode",
                schema: "identity",
                table: "users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Client");

            migrationBuilder.CreateTable(
                name: "chats",
                schema: "chats",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_read_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    master_read_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    client_cleared_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    master_cleared_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    client_hidden = table.Column<bool>(type: "boolean", nullable: false),
                    master_hidden = table.Column<bool>(type: "boolean", nullable: false),
                    blocked_by = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    last_message_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chats", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "media_files",
                schema: "platform",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    content_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    storage_key = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_media_files", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "messages",
                schema: "chats",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    chat_id = table.Column<Guid>(type: "uuid", nullable: false),
                    kind = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    author_role = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    text = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    media_url = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: true),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    edited_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_messages", x => x.id);
                    table.CheckConstraint("ck_messages_booking", "kind <> 'Booking' OR booking_id IS NOT NULL");
                    table.CheckConstraint("ck_messages_system", "kind <> 'System' OR (text IS NOT NULL AND author_role IS NULL)");
                    table.CheckConstraint("ck_messages_text_content", "kind <> 'Text' OR deleted_at IS NOT NULL OR text IS NOT NULL OR media_url IS NOT NULL");
                    table.ForeignKey(
                        name: "fk_messages_chats_chat_id",
                        column: x => x.chat_id,
                        principalSchema: "chats",
                        principalTable: "chats",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_chats_client_user_id_last_message_at",
                schema: "chats",
                table: "chats",
                columns: new[] { "client_user_id", "last_message_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_chats_master_id_client_user_id",
                schema: "chats",
                table: "chats",
                columns: new[] { "master_id", "client_user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_chats_master_id_last_message_at",
                schema: "chats",
                table: "chats",
                columns: new[] { "master_id", "last_message_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "ix_media_files_owner_user_id",
                schema: "platform",
                table: "media_files",
                column: "owner_user_id");

            migrationBuilder.CreateIndex(
                name: "ix_messages_chat_id_booking_id",
                schema: "chats",
                table: "messages",
                columns: new[] { "chat_id", "booking_id" },
                filter: "booking_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_messages_chat_id_sent_at_id",
                schema: "chats",
                table: "messages",
                columns: new[] { "chat_id", "sent_at", "id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "media_files",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "messages",
                schema: "chats");

            migrationBuilder.DropTable(
                name: "chats",
                schema: "chats");

            migrationBuilder.DropColumn(
                name: "active_mode",
                schema: "identity",
                table: "users");
        }
    }
}
