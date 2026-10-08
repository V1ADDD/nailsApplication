using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPhoneSignIn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "phone_codes",
                schema: "identity",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
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
                    table.PrimaryKey("pk_phone_codes", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_phone_codes_phone",
                schema: "identity",
                table: "phone_codes",
                column: "phone",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "phone_codes",
                schema: "identity");
        }
    }
}
