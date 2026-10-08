using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalogAndMasters : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "catalog");

            migrationBuilder.EnsureSchema(
                name: "masters");

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "cities",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "profiles",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    about = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    phone = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    city_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    version = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_profiles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "services",
                schema: "catalog",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    category_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_services", x => x.id);
                    table.ForeignKey(
                        name: "fk_services_category_category_id",
                        column: x => x.category_id,
                        principalSchema: "catalog",
                        principalTable: "categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "offers",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    service_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    category_id = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    price_kind = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    price = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_offers", x => x.id);
                    table.ForeignKey(
                        name: "fk_offers_profiles_master_id",
                        column: x => x.master_id,
                        principalSchema: "masters",
                        principalTable: "profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                schema: "catalog",
                table: "categories",
                columns: new[] { "id", "name", "sort_order" },
                values: new object[,]
                {
                    { "brows", "Брови", 2 },
                    { "cosmetology", "Косметология", 4 },
                    { "depilation", "Депиляция", 6 },
                    { "lashes", "Ресницы", 3 },
                    { "makeup", "Макияж", 5 },
                    { "nails", "Ногти", 1 }
                });

            migrationBuilder.InsertData(
                schema: "catalog",
                table: "cities",
                columns: new[] { "id", "name", "sort_order" },
                values: new object[,]
                {
                    { "baranovichi", "Барановичи", 7 },
                    { "bobruisk", "Бобруйск", 8 },
                    { "borisov", "Борисов", 9 },
                    { "brest", "Брест", 2 },
                    { "gomel", "Гомель", 4 },
                    { "grodno", "Гродно", 5 },
                    { "lida", "Лида", 15 },
                    { "minsk", "Минск", 1 },
                    { "mogilev", "Могилёв", 6 },
                    { "molodechno", "Молодечно", 16 },
                    { "mozyr", "Мозырь", 12 },
                    { "novopolotsk", "Новополоцк", 14 },
                    { "orsha", "Орша", 11 },
                    { "pinsk", "Пинск", 10 },
                    { "polotsk", "Полоцк", 17 },
                    { "rechitsa", "Речица", 20 },
                    { "slutsk", "Слуцк", 21 },
                    { "soligorsk", "Солигорск", 13 },
                    { "svetlogorsk", "Светлогорск", 19 },
                    { "vitebsk", "Витебск", 3 },
                    { "zhlobin", "Жлобин", 18 },
                    { "zhodino", "Жодино", 22 }
                });

            migrationBuilder.InsertData(
                schema: "catalog",
                table: "services",
                columns: new[] { "id", "category_id", "name", "sort_order" },
                values: new object[,]
                {
                    { "brow-correction", "brows", "Коррекция бровей", 1 },
                    { "brow-lamination", "brows", "Ламинирование бровей", 3 },
                    { "brow-permanent", "brows", "Перманентный макияж бровей", 4 },
                    { "brow-tint", "brows", "Окрашивание бровей", 2 },
                    { "face-care", "cosmetology", "Уходовая процедура для лица", 4 },
                    { "face-cleansing", "cosmetology", "Чистка лица", 1 },
                    { "face-massage", "cosmetology", "Массаж лица", 3 },
                    { "face-peeling", "cosmetology", "Пилинг лица", 2 },
                    { "laser-hair-removal", "depilation", "Лазерная эпиляция", 3 },
                    { "lash-extension-classic", "lashes", "Наращивание ресниц, классика", 1 },
                    { "lash-extension-volume", "lashes", "Наращивание ресниц, объём", 2 },
                    { "lash-lamination", "lashes", "Ламинирование ресниц", 3 },
                    { "lash-tint", "lashes", "Окрашивание ресниц", 4 },
                    { "makeup-day", "makeup", "Дневной макияж", 1 },
                    { "makeup-evening", "makeup", "Вечерний макияж", 2 },
                    { "makeup-wedding", "makeup", "Свадебный макияж", 3 },
                    { "manicure-classic", "nails", "Маникюр классический", 1 },
                    { "manicure-gel", "nails", "Маникюр с покрытием гель-лак", 2 },
                    { "nail-design", "nails", "Дизайн ногтей", 6 },
                    { "nail-extension", "nails", "Наращивание ногтей", 3 },
                    { "pedicure-classic", "nails", "Педикюр классический", 4 },
                    { "pedicure-gel", "nails", "Педикюр с покрытием гель-лак", 5 },
                    { "sugaring", "depilation", "Шугаринг", 1 },
                    { "wax-depilation", "depilation", "Восковая депиляция", 2 }
                });

            migrationBuilder.CreateIndex(
                name: "ix_offers_category_id",
                schema: "masters",
                table: "offers",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_offers_master_id_service_id",
                schema: "masters",
                table: "offers",
                columns: new[] { "master_id", "service_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_offers_service_id_price",
                schema: "masters",
                table: "offers",
                columns: new[] { "service_id", "price" });

            migrationBuilder.CreateIndex(
                name: "ix_profiles_city_id",
                schema: "masters",
                table: "profiles",
                column: "city_id");

            migrationBuilder.CreateIndex(
                name: "ix_profiles_created_at",
                schema: "masters",
                table: "profiles",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "ix_profiles_user_id",
                schema: "masters",
                table: "profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_services_category_id",
                schema: "catalog",
                table: "services",
                column: "category_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cities",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "offers",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "services",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "profiles",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "catalog");
        }
    }
}
