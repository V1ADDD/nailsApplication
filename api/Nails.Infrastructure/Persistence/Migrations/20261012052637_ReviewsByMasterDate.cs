using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ReviewsByMasterDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reviews_master_id_author_role",
                schema: "masters",
                table: "reviews");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_master_id_author_role_created_at",
                schema: "masters",
                table: "reviews",
                columns: new[] { "master_id", "author_role", "created_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_reviews_master_id_author_role_created_at",
                schema: "masters",
                table: "reviews");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_master_id_author_role",
                schema: "masters",
                table: "reviews",
                columns: new[] { "master_id", "author_role" });
        }
    }
}
