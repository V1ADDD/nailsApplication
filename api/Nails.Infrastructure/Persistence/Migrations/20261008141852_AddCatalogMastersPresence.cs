using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Nails.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCatalogMastersPresence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "masters");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "last_seen_at",
                schema: "identity",
                table: "users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "master_id",
                schema: "identity",
                table: "users",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "bookings",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    external_client_name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    subcategory_id = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    price_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    price_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    start_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    duration_min = table.Column<int>(type: "integer", nullable: false),
                    address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_by = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    confirmed_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cancelled_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    cancelled_by = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    cancel_reason = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    cancel_mutual = table.Column<bool>(type: "boolean", nullable: false),
                    cancel_expired = table.Column<bool>(type: "boolean", nullable: false),
                    note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    slot_id = table.Column<Guid>(type: "uuid", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "courses",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    school = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_courses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "favorites",
                schema: "masters",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_favorites", x => new { x.user_id, x.master_id });
                });

            migrationBuilder.CreateTable(
                name: "masters",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    organization_id = table.Column<Guid>(type: "uuid", nullable: true),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    specialty = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    category_ids = table.Column<List<string>>(type: "text[]", nullable: false),
                    city = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    district = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    address = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    lat = table.Column<double>(type: "double precision", nullable: false),
                    lng = table.Column<double>(type: "double precision", nullable: false),
                    experience_years = table.Column<int>(type: "integer", nullable: false),
                    about = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    verification_status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    show_online = table.Column<bool>(type: "boolean", nullable: false),
                    phone = table.Column<string>(type: "character varying(13)", maxLength: 13, nullable: false),
                    email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    telegram = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    viber = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    instagram = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_masters", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "portfolio_photos",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    hue = table.Column<int>(type: "integer", nullable: false),
                    caption = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_portfolio_photos", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: true),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    author_role = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    subcategory_id = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    text = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reviews", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "schedules",
                schema: "masters",
                columns: table => new
                {
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    work_days = table.Column<List<int>>(type: "integer[]", nullable: false),
                    time_from = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    time_to = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    slot_minutes = table.Column<int>(type: "integer", nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    auto_confirm_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    auto_confirm_after_minutes = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    breaks = table.Column<string>(type: "jsonb", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_schedules", x => x.master_id);
                });

            migrationBuilder.CreateTable(
                name: "services",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    subcategory_id = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    price_kind = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    price_amount = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: true),
                    duration_min = table.Column<int>(type: "integer", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_services", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "slots",
                schema: "masters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    master_id = table.Column<Guid>(type: "uuid", nullable: false),
                    start_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    duration_min = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: true),
                    version = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_slots", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_client_user_id_start_at",
                schema: "masters",
                table: "bookings",
                columns: new[] { "client_user_id", "start_at" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_master_id_start_at",
                schema: "masters",
                table: "bookings",
                columns: new[] { "master_id", "start_at" });

            migrationBuilder.CreateIndex(
                name: "ix_bookings_status_start_at",
                schema: "masters",
                table: "bookings",
                columns: new[] { "status", "start_at" });

            migrationBuilder.CreateIndex(
                name: "ix_courses_master_id",
                schema: "masters",
                table: "courses",
                column: "master_id");

            migrationBuilder.CreateIndex(
                name: "ix_favorites_master_id",
                schema: "masters",
                table: "favorites",
                column: "master_id");

            migrationBuilder.CreateIndex(
                name: "ix_masters_city",
                schema: "masters",
                table: "masters",
                column: "city");

            migrationBuilder.CreateIndex(
                name: "ix_masters_deleted_at",
                schema: "masters",
                table: "masters",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "ix_masters_lat_lng",
                schema: "masters",
                table: "masters",
                columns: new[] { "lat", "lng" });

            migrationBuilder.CreateIndex(
                name: "ix_masters_user_id",
                schema: "masters",
                table: "masters",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_portfolio_photos_master_id",
                schema: "masters",
                table: "portfolio_photos",
                column: "master_id");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_booking_id_author_role",
                schema: "masters",
                table: "reviews",
                columns: new[] { "booking_id", "author_role" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reviews_master_id_author_role",
                schema: "masters",
                table: "reviews",
                columns: new[] { "master_id", "author_role" });

            migrationBuilder.CreateIndex(
                name: "ix_services_master_id_subcategory_id",
                schema: "masters",
                table: "services",
                columns: new[] { "master_id", "subcategory_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_slots_master_id_start_at",
                schema: "masters",
                table: "slots",
                columns: new[] { "master_id", "start_at" });

            migrationBuilder.CreateIndex(
                name: "ix_slots_status_start_at",
                schema: "masters",
                table: "slots",
                columns: new[] { "status", "start_at" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bookings",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "courses",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "favorites",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "masters",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "portfolio_photos",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "reviews",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "schedules",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "services",
                schema: "masters");

            migrationBuilder.DropTable(
                name: "slots",
                schema: "masters");

            migrationBuilder.DropColumn(
                name: "last_seen_at",
                schema: "identity",
                table: "users");

            migrationBuilder.DropColumn(
                name: "master_id",
                schema: "identity",
                table: "users");
        }
    }
}
