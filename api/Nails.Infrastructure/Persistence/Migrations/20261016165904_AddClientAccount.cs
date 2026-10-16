using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddClientAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "EmailIndex",
                schema: "identity",
                table: "users");

            migrationBuilder.AddColumn<bool>(
                name: "notify_email",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "notify_push",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "notify_reminders",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "notify_site",
                schema: "identity",
                table: "users",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "photo_url",
                schema: "identity",
                table: "users",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "preferred_contact",
                schema: "identity",
                table: "users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Messages");

            migrationBuilder.AddColumn<string>(
                name: "telegram",
                schema: "identity",
                table: "users",
                type: "character varying(33)",
                maxLength: 33,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "viber",
                schema: "identity",
                table: "users",
                type: "character varying(13)",
                maxLength: 13,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "location_set",
                schema: "masters",
                table: "masters",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "booking_moves",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    slot_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    duration_min = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    lapses_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    resolved_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_booking_moves", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "phone_change_codes",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    phone = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    code_hash = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    sent_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    attempts = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_phone_change_codes", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "identity",
                table: "users",
                column: "normalized_email",
                unique: true,
                filter: "\"normalized_email\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_client_user_id_author_role_created_at",
                schema: "masters",
                table: "reviews",
                columns: new[] { "client_user_id", "author_role", "created_at" });

            migrationBuilder.CreateIndex(
                name: "ix_booking_moves_booking_id",
                schema: "masters",
                table: "booking_moves",
                column: "booking_id",
                unique: true,
                filter: "\"status\" = 'Open'");

            migrationBuilder.CreateIndex(
                name: "ix_booking_moves_status_lapses_at",
                schema: "masters",
                table: "booking_moves",
                columns: new[] { "status", "lapses_at" });

            migrationBuilder.CreateIndex(
                name: "ix_phone_change_codes_user_id",
                schema: "identity",
                table: "phone_change_codes",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "booking_moves",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "phone_change_codes",
                schema: "identity");

            migrationBuilder.DropIndex(
                name: "EmailIndex",
                schema: "identity",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_reviews_client_user_id_author_role_created_at",
                schema: "masters",
                table: "reviews");

            migrationBuilder.DropColumn(
                name: "notify_email",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "notify_push",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "notify_reminders",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "notify_site",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "photo_url",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "preferred_contact",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "telegram",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "viber",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "location_set",
                schema: "masters",
                table: "masters");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                schema: "identity",
                table: "users",
                column: "normalized_email");
        }
    }
}
