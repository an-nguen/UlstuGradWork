using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Instant>(
                name: "created_at",
                table: "books",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: NodaTime.Instant.FromUnixTimeTicks(0L));

            migrationBuilder.AddColumn<Guid>(
                name: "owner_id",
                table: "books",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Instant>(
                name: "updated_at",
                table: "books",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_books_owner_id",
                table: "books",
                column: "owner_id");

            migrationBuilder.AddForeignKey(
                name: "fk_books_users_owner_id",
                table: "books",
                column: "owner_id",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_books_users_owner_id",
                table: "books");

            migrationBuilder.DropIndex(
                name: "ix_books_owner_id",
                table: "books");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "books");

            migrationBuilder.DropColumn(
                name: "owner_id",
                table: "books");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "books");
        }
    }
}
