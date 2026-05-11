-- AlterTable
ALTER TABLE "users" ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "phone_number" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

