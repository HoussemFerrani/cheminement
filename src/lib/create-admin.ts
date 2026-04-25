import bcrypt from "bcryptjs";
import connectToDatabase from "./mongodb";
import User from "@/models/User";
import Admin from "@/models/Admin";

async function createAdminUser() {
  try {
    // Connect to database
    await connectToDatabase();
    console.log("Connected to database");

    // Check if admin user already exists
    const existingUser = await User.findOne({
      email: "admin@admin.com",
    });

    if (existingUser?.isAdmin) {
      console.log("Super admin user already exists!");
      return;
    }

    // If user exists but isn't admin, update them
    if (existingUser) {
      console.log("Updating existing user to super admin...");

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash("admin123", saltRounds);

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        existingUser._id,
        {
          password: hashedPassword,
          role: "admin",
          isAdmin: true,
          status: "active",
          language: "en",
        },
        { new: true },
      );

      // Create admin record
      const adminRecord = new Admin({
        userId: updatedUser!._id,
        role: "super_admin",
        permissions: {
          manageUsers: true,
          manageProfessionals: true,
          managePatients: true,
          approveProfessionals: true,
          manageContent: true,
          viewAnalytics: true,
          manageReports: true,
          manageBilling: true,
          manageAdmins: true,
          createAdmins: true,
          deleteAdmins: true,
          manageSettings: true,
          managePlatform: true,
        },
        createdBy: updatedUser!._id, // Self-created
        isActive: true,
      });

      await adminRecord.save();

      // Update user with admin reference
      await User.findByIdAndUpdate(updatedUser!._id, {
        adminId: adminRecord._id,
      });

      console.log("Super admin user updated successfully!");
    } else {
      // Create new admin user
      console.log("Creating new super admin user...");

      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash("admin123", saltRounds);

      // Create admin user
      const adminUser = new User({
        email: "admin@admin.com",
        password: hashedPassword,
        firstName: "Super",
        lastName: "Admin",
        role: "admin",
        isAdmin: true,
        status: "active",
        language: "en",
      });

      const savedUser = await adminUser.save();

      // Create admin record
      const adminRecord = new Admin({
        userId: savedUser._id,
        role: "super_admin",
        permissions: {
          manageUsers: true,
          manageProfessionals: true,
          managePatients: true,
          approveProfessionals: true,
          manageContent: true,
          viewAnalytics: true,
          manageReports: true,
          manageBilling: true,
          manageAdmins: true,
          createAdmins: true,
          deleteAdmins: true,
          manageSettings: true,
          managePlatform: true,
        },
        createdBy: savedUser._id, // Self-created
        isActive: true,
      });

      await adminRecord.save();

      // Update user with admin reference
      await User.findByIdAndUpdate(savedUser._id, {
        adminId: adminRecord._id,
      });

      console.log("Super admin user created successfully!");
    }

    console.log("Email: admin@admin.com");
    console.log("Password: admin123");
    console.log("Role: Super Administrator (Full Access)");
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  } finally {
    // Close the connection
    process.exit(0);
  }
}

// Run the script
createAdminUser();
