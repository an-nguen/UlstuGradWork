using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDictionaryWordAlias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "dictionary_word_alias",
                columns: table => new
                {
                    alias = table.Column<string>(type: "text", nullable: false),
                    dictionary_word_word = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_dictionary_word_alias", x => x.alias);
                    table.ForeignKey(
                        name: "fk_dictionary_word_alias_dictionary_words_dictionary_word_word",
                        column: x => x.dictionary_word_word,
                        principalTable: "dictionary_words",
                        principalColumn: "word");
                });

            migrationBuilder.CreateIndex(
                name: "ix_dictionary_word_alias_dictionary_word_word",
                table: "dictionary_word_alias",
                column: "dictionary_word_word");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "dictionary_word_alias");
        }
    }
}
