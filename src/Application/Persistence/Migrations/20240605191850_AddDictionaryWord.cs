using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDictionaryWord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dictionary_words",
                columns: table => new
                {
                    word = table.Column<string>(type: "text", nullable: false),
                    transcription = table.Column<string>(type: "text", nullable: true),
                    language_code = table.Column<string>(type: "text", nullable: true),
                    stems = table.Column<string[]>(type: "text[]", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dictionary_words", x => x.word);
                });

            migrationBuilder.CreateTable(
                name: "dictionary_word_definition",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    subject_name = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: false),
                    definition = table.Column<string>(type: "character varying(8192)", maxLength: 8192, nullable: false),
                    part_of_speech = table.Column<string>(type: "text", nullable: false),
                    dictionary_word_id = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dictionary_word_definition", x => x.id);
                    table.ForeignKey(
                        name: "fk_dictionary_word_definition_dictionary_words_dictionary_word",
                        column: x => x.dictionary_word_id,
                        principalTable: "dictionary_words",
                        principalColumn: "word",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_word_definition_dictionary_word_id",
                table: "dictionary_word_definition",
                column: "dictionary_word_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dictionary_word_definition");

            migrationBuilder.DropTable(
                name: "dictionary_words");
        }
    }
}
