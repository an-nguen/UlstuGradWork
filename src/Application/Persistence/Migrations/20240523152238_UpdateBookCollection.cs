using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookCollection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "book_collections",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<Instant>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_book_collections", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "book_book_collection",
                columns: table => new
                {
                    books_id = table.Column<Guid>(type: "uuid", nullable: false),
                    collections_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_book_book_collection", x => new { x.books_id, x.collections_id });
                    table.ForeignKey(
                        name: "fk_book_book_collection_book_collections_collections_id",
                        column: x => x.collections_id,
                        principalTable: "book_collections",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_book_book_collection_books_books_id",
                        column: x => x.books_id,
                        principalTable: "books",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_book_book_collection_collections_id",
                table: "book_book_collection",
                column: "collections_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "book_book_collection");

            migrationBuilder.DropTable(
                name: "book_collections");
        }
    }
}
