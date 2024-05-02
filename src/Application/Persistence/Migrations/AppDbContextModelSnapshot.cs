﻿// <auto-generated />
using System;
using BookManager.Application.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using NodaTime;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace BookManager.Application.Persistence.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.4")
                .HasAnnotation("Relational:MaxIdentifierLength", 63);

            NpgsqlModelBuilderExtensions.UseIdentityByDefaultColumns(modelBuilder);

            modelBuilder.Entity("BookManager.Domain.Entities.Book", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("Description")
                        .HasMaxLength(16384)
                        .HasColumnType("character varying(16384)")
                        .HasColumnName("description");

                    b.Property<long>("FileSize")
                        .HasColumnType("bigint")
                        .HasColumnName("file_size");

                    b.Property<int>("FileType")
                        .HasColumnType("integer")
                        .HasColumnName("file_type");

                    b.Property<string>("Filepath")
                        .IsRequired()
                        .HasMaxLength(4096)
                        .HasColumnType("character varying(4096)")
                        .HasColumnName("filepath");

                    b.Property<string>("Isbn")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)")
                        .HasColumnName("isbn");

                    b.Property<string>("PublisherName")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)")
                        .HasColumnName("publisher_name");

                    b.Property<byte[]>("Thumbnail")
                        .HasColumnType("bytea")
                        .HasColumnName("thumbnail");

                    b.Property<string>("Title")
                        .HasMaxLength(256)
                        .HasColumnType("character varying(256)")
                        .HasColumnName("title");

                    b.HasKey("Id")
                        .HasName("pk_books");

                    b.ToTable("books", (string)null);
                });

            modelBuilder.Entity("BookManager.Domain.Entities.BookText", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<Guid>("BookDocumentId")
                        .HasColumnType("uuid")
                        .HasColumnName("book_document_id");

                    b.Property<int?>("PageNumber")
                        .HasColumnType("integer")
                        .HasColumnName("page_number");

                    b.Property<string>("Text")
                        .IsRequired()
                        .HasMaxLength(4194304)
                        .HasColumnType("character varying(4194304)")
                        .HasColumnName("text");

                    b.HasKey("Id")
                        .HasName("pk_book_texts");

                    b.HasIndex("Text")
                        .HasDatabaseName("ix_book_texts_text")
                        .HasAnnotation("Npgsql:TsVectorConfig", "english");

                    NpgsqlIndexBuilderExtensions.HasMethod(b.HasIndex("Text"), "GIN");

                    b.ToTable("book_texts", (string)null);
                });

            modelBuilder.Entity("BookManager.Domain.Entities.BookUserStats", b =>
                {
                    b.Property<Guid>("BookId")
                        .HasColumnType("uuid")
                        .HasColumnName("book_id");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uuid")
                        .HasColumnName("user_id");

                    b.Property<int?>("LastPage")
                        .HasColumnType("integer")
                        .HasColumnName("last_page");

                    b.Property<Instant>("RecentAccess")
                        .HasColumnType("timestamp with time zone")
                        .HasColumnName("recent_access");

                    b.Property<long>("TotalReadingTime")
                        .HasColumnType("bigint")
                        .HasColumnName("total_reading_time");

                    b.HasKey("BookId", "UserId")
                        .HasName("pk_book_user_stats_set");

                    b.HasIndex("UserId")
                        .HasDatabaseName("ix_book_user_stats_set_user_id");

                    b.ToTable("book_user_stats_set", (string)null);
                });

            modelBuilder.Entity("BookManager.Domain.Entities.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uuid")
                        .HasColumnName("id");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("name");

                    b.Property<string>("PinCode")
                        .IsRequired()
                        .HasColumnType("text")
                        .HasColumnName("pin_code");

                    b.HasKey("Id")
                        .HasName("pk_users");

                    b.ToTable("users", (string)null);
                });

            modelBuilder.Entity("BookManager.Domain.Entities.BookUserStats", b =>
                {
                    b.HasOne("BookManager.Domain.Entities.Book", null)
                        .WithMany("Stats")
                        .HasForeignKey("BookId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_book_user_stats_set_books_book_id");

                    b.HasOne("BookManager.Domain.Entities.User", null)
                        .WithMany("Stats")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("fk_book_user_stats_set_users_user_id");
                });

            modelBuilder.Entity("BookManager.Domain.Entities.Book", b =>
                {
                    b.Navigation("Stats");
                });

            modelBuilder.Entity("BookManager.Domain.Entities.User", b =>
                {
                    b.Navigation("Stats");
                });
#pragma warning restore 612, 618
        }
    }
}
