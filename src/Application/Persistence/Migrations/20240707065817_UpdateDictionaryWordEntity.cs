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
            migrationBuilder.DropForeignKey(
                name: "fk_dictionary_word_definition_dictionary_words_dictionary_word",
                table: "dictionary_word_definition");

            migrationBuilder.DropPrimaryKey(
                name: "pk_dictionary_words",
                table: "dictionary_words");

            migrationBuilder.DropIndex(
                name: "ix_dictionary_word_definition_dictionary_word_id",
                table: "dictionary_word_definition");

            migrationBuilder.DropColumn(
                name: "dictionary_word_id",
                table: "dictionary_word_definition");

            migrationBuilder.AddColumn<Guid>(
                name: "id",
                table: "dictionary_words",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

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

            migrationBuilder.AddColumn<Guid>(
                name: "word_id",
                table: "dictionary_word_definition",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "pk_dictionary_words",
                table: "dictionary_words",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_words_user_id",
                table: "dictionary_words",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_word_definition_word_id",
                table: "dictionary_word_definition",
                column: "word_id");

            migrationBuilder.AddForeignKey(
                name: "fk_dictionary_word_definition_dictionary_words_word_id",
                table: "dictionary_word_definition",
                column: "word_id",
                principalTable: "dictionary_words",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

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
                name: "fk_dictionary_word_definition_dictionary_words_word_id",
                table: "dictionary_word_definition");

            migrationBuilder.DropForeignKey(
                name: "fk_dictionary_words_users_user_id",
                table: "dictionary_words");

            migrationBuilder.DropPrimaryKey(
                name: "pk_dictionary_words",
                table: "dictionary_words");

            migrationBuilder.DropIndex(
                name: "ix_dictionary_words_user_id",
                table: "dictionary_words");

            migrationBuilder.DropIndex(
                name: "ix_dictionary_word_definition_word_id",
                table: "dictionary_word_definition");

            migrationBuilder.DropColumn(
                name: "id",
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

            migrationBuilder.DropColumn(
                name: "word_id",
                table: "dictionary_word_definition");

            migrationBuilder.AddColumn<string>(
                name: "dictionary_word_id",
                table: "dictionary_word_definition",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "pk_dictionary_words",
                table: "dictionary_words",
                column: "word");

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_word_definition_dictionary_word_id",
                table: "dictionary_word_definition",
                column: "dictionary_word_id");

            migrationBuilder.AddForeignKey(
                name: "fk_dictionary_word_definition_dictionary_words_dictionary_word",
                table: "dictionary_word_definition",
                column: "dictionary_word_id",
                principalTable: "dictionary_words",
                principalColumn: "word",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
