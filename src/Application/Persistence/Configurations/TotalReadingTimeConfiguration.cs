using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace BookManager.Application.Persistence.Configurations;

internal class TotalReadingTimeConfiguration : IEntityTypeConfiguration<TotalReadingTime>
{
    public void Configure(EntityTypeBuilder<TotalReadingTime> builder)
    {
        builder.HasKey(trt => new { trt.BookId, trt.TicketId });
        builder
            .Navigation(trt => trt.Ticket)
            .AutoInclude();
    }
}