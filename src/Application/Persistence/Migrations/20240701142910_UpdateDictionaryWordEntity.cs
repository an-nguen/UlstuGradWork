using System;
using Microsoft.EntityFrameworkCore.Migrations;
using NodaTime;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDictionaryWordEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Instant>(
                name: "created_at",
                table: "dictionary_words",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: NodaTime.Instant.FromUnixTimeTicks(0L));

            migrationBuilder.AddColumn<Instant>(
                name: "updated_at",
                table: "dictionary_words",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "dictionary_words",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_words_user_id",
                table: "dictionary_words",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "fk_dictionary_words_users_user_id",
                table: "dictionary_words",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_dictionary_words_users_user_id",
                table: "dictionary_words");

            migrationBuilder.DropIndex(
                name: "ix_dictionary_words_user_id",
                table: "dictionary_words");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "dictionary_words");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "dictionary_words");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "dictionary_words");
        }
    }
}
