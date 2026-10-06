using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHanziTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Hanzis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Character = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Meaning = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StrokeCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hanzis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HanziPronunciation",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HanziId = table.Column<int>(type: "int", nullable: false),
                    Pinyin = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AudioUrl = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HanziPronunciation", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HanziPronunciation_Hanzis_HanziId",
                        column: x => x.HanziId,
                        principalTable: "Hanzis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HanziStroke",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HanziId = table.Column<int>(type: "int", nullable: false),
                    StrokeNumber = table.Column<int>(type: "int", nullable: false),
                    StrokeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StrokeData = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HanziStroke", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HanziStroke_Hanzis_HanziId",
                        column: x => x.HanziId,
                        principalTable: "Hanzis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VocabularyHanzis",
                columns: table => new
                {
                    VocabularyId = table.Column<int>(type: "int", nullable: false),
                    HanziId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VocabularyHanzis", x => new { x.VocabularyId, x.HanziId });
                    table.ForeignKey(
                        name: "FK_VocabularyHanzis_Hanzis_HanziId",
                        column: x => x.HanziId,
                        principalTable: "Hanzis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VocabularyHanzis_Vocabularies_VocabularyId",
                        column: x => x.VocabularyId,
                        principalTable: "Vocabularies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HanziPronunciation_HanziId",
                table: "HanziPronunciation",
                column: "HanziId");

            migrationBuilder.CreateIndex(
                name: "IX_Hanzis_Character",
                table: "Hanzis",
                column: "Character",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HanziStroke_HanziId",
                table: "HanziStroke",
                column: "HanziId");

            migrationBuilder.CreateIndex(
                name: "IX_VocabularyHanzis_HanziId",
                table: "VocabularyHanzis",
                column: "HanziId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HanziPronunciation");

            migrationBuilder.DropTable(
                name: "HanziStroke");

            migrationBuilder.DropTable(
                name: "VocabularyHanzis");

            migrationBuilder.DropTable(
                name: "Hanzis");
        }
    }
}
