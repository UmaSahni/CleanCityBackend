// Import required models
const Category = require('../models/Category');
const Status = require('../models/Status');

// Initial categories data
const categoriesData = [
    {
        name: 'Roads & Infrastructure',
        description: 'Potholes, road damage, street lighting, traffic signals',
        icon: 'fas fa-road',
        color: '#EF4444'
    },
    {
        name: 'Waste Management',
        description: 'Garbage collection, litter, waste disposal issues',
        icon: 'fas fa-trash',
        color: '#10B981'
    },
    {
        name: 'Water & Sewage',
        description: 'Water supply, drainage, sewage problems',
        icon: 'fas fa-tint',
        color: '#3B82F6'
    },
    {
        name: 'Public Safety',
        description: 'Street safety, crime, emergency services',
        icon: 'fas fa-shield-alt',
        color: '#F59E0B'
    },
    {
        name: 'Environment',
        description: 'Air quality, noise pollution, green spaces',
        icon: 'fas fa-leaf',
        color: '#22C55E'
    },
    {
        name: 'Transportation',
        description: 'Public transport, parking, traffic management',
        icon: 'fas fa-bus',
        color: '#8B5CF6'
    },
    {
        name: 'Utilities',
        description: 'Electricity, internet, cable services',
        icon: 'fas fa-bolt',
        color: '#F97316'
    },
    {
        name: 'Other',
        description: 'Other civic issues not covered above',
        icon: 'fas fa-question-circle',
        color: '#6B7280'
    }
];

// Initial statuses data
const statusesData = [
    {
        name: 'Submitted',
        description: 'Complaint has been submitted and is under review',
        order: 1,
        color: '#6B7280',
        icon: 'fas fa-paper-plane',
        requiresAdminAction: true
    },
    {
        name: 'Under Review',
        description: 'Complaint is being reviewed by authorities',
        order: 2,
        color: '#3B82F6',
        icon: 'fas fa-search',
        requiresAdminAction: true
    },
    {
        name: 'In Progress',
        description: 'Work has started on resolving the complaint',
        order: 3,
        color: '#F59E0B',
        icon: 'fas fa-tools',
        requiresAdminAction: false
    },
    {
        name: 'Resolved',
        description: 'Complaint has been successfully resolved',
        order: 4,
        color: '#10B981',
        icon: 'fas fa-check-circle',
        isFinal: true,
        requiresAdminAction: false
    },
    {
        name: 'Rejected',
        description: 'Complaint has been rejected due to invalid information',
        order: 5,
        color: '#EF4444',
        icon: 'fas fa-times-circle',
        isFinal: true,
        requiresAdminAction: true
    },
    {
        name: 'Duplicate',
        description: 'Complaint is a duplicate of an existing issue',
        order: 6,
        color: '#8B5CF6',
        icon: 'fas fa-copy',
        isFinal: true,
        requiresAdminAction: true
    }
];

// Function to seed categories
const seedCategories = async () => {
    try {
        // Clear existing categories
        await Category.deleteMany({});

        // Insert new categories
        const categories = await Category.insertMany(categoriesData);
        console.log(`✅ Seeded ${categories.length} categories`);
        return categories;
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    }
};

// Function to seed statuses
const seedStatuses = async () => {
    try {
        // Clear existing statuses
        await Status.deleteMany({});

        // Insert new statuses
        const statuses = await Status.insertMany(statusesData);
        console.log(`✅ Seeded ${statuses.length} statuses`);
        return statuses;
    } catch (error) {
        console.error('❌ Error seeding statuses:', error);
        throw error;
    }
};

// Function to seed all data
const seedAll = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        const categories = await seedCategories();
        const statuses = await seedStatuses();

        console.log('✅ Database seeding completed successfully!');
        console.log(`📊 Categories: ${categories.length}`);
        console.log(`📊 Statuses: ${statuses.length}`);

        return { categories, statuses };
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};

// Export functions
module.exports = {
    seedCategories,
    seedStatuses,
    seedAll,
    categoriesData,
    statusesData
};
