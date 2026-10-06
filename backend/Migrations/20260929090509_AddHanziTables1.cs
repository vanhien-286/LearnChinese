using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHanziTables1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_VocabularyHanzis",
                table: "VocabularyHanzis");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "VocabularyHanzis",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VocabularyHanzis",
                table: "VocabularyHanzis",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_VocabularyHanzis_VocabularyId_Position",
                table: "VocabularyHanzis",
                columns: new[] { "VocabularyId", "Position" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_VocabularyHanzis",
                table: "VocabularyHanzis");

            migrationBuilder.DropIndex(
                name: "IX_VocabularyHanzis_VocabularyId_Position",
                table: "VocabularyHanzis");

            migrationBuilder.DropColumn(
                name: "Id",
                table: "VocabularyHanzis");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VocabularyHanzis",
                table: "VocabularyHanzis",
                columns: new[] { "VocabularyId", "HanziId" });
        }
    }
}
