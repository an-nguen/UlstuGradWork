using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBookUserStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "last_page",
                table: "book_user_stats_set",
                newName: "last_viewed_page");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "last_viewed_page",
                table: "book_user_stats_set",
                newName: "last_page");
        }
    }
}
