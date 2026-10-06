using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddHanziPronunciation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HanziStroke_HanziId",
                table: "HanziStroke");

            migrationBuilder.DropIndex(
                name: "IX_HanziPronunciation_HanziId",
                table: "HanziPronunciation");

            migrationBuilder.AlterColumn<string>(
                name: "Pinyin",
                table: "HanziPronunciation",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_HanziStroke_HanziId_StrokeNumber",
                table: "HanziStroke",
                columns: new[] { "HanziId", "StrokeNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HanziPronunciation_HanziId_Pinyin",
                table: "HanziPronunciation",
                columns: new[] { "HanziId", "Pinyin" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HanziStroke_HanziId_StrokeNumber",
                table: "HanziStroke");

            migrationBuilder.DropIndex(
                name: "IX_HanziPronunciation_HanziId_Pinyin",
                table: "HanziPronunciation");

            migrationBuilder.AlterColumn<string>(
                name: "Pinyin",
                table: "HanziPronunciation",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.CreateIndex(
                name: "IX_HanziStroke_HanziId",
                table: "HanziStroke",
                column: "HanziId");

            migrationBuilder.CreateIndex(
                name: "IX_HanziPronunciation_HanziId",
                table: "HanziPronunciation",
                column: "HanziId");
        }
    }
}
