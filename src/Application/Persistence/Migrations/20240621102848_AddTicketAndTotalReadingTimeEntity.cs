using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketAndTotalReadingTimeEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_reading_time",
                table: "book_user_stats_set");

            migrationBuilder.AlterColumn<Instant>(
                name: "recent_access",
                table: "book_user_stats_set",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(Instant),
                oldType: "timestamp with time zone");

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    issued_at = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tickets", x => x.id);
                    table.ForeignKey(
                        name: "fk_tickets_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "total_reading_times",
                columns: table => new
                {
                    book_id = table.Column<Guid>(type: "uuid", nullable: false),
                    ticket_id = table.Column<Guid>(type: "uuid", nullable: false),
                    time_in_seconds = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_total_reading_times", x => new { x.book_id, x.ticket_id });
                    table.ForeignKey(
                        name: "fk_total_reading_times_books_book_id",
                        column: x => x.book_id,
                        principalTable: "books",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_total_reading_times_tickets_ticket_id",
                        column: x => x.ticket_id,
                        principalTable: "tickets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_tickets_user_id",
                table: "tickets",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_total_reading_times_ticket_id",
                table: "total_reading_times",
                column: "ticket_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "total_reading_times");

            migrationBuilder.DropTable(
                name: "tickets");

            migrationBuilder.AlterColumn<Instant>(
                name: "recent_access",
                table: "book_user_stats_set",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: NodaTime.Instant.FromUnixTimeTicks(0L),
                oldClrType: typeof(Instant),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "total_reading_time",
                table: "book_user_stats_set",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }
    }
}
