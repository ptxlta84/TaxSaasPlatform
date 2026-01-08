const TaxProfile = require('../models/TaxProfile');
const IncomeTaxReturn = require('../models/IncomeTaxReturn');

/**
 * Calculates the current state and progress of the user's tax filing journey.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - State object { state, progress, nextStep, status }
 */
exports.calculateDashboardState = async (userId) => {
    try {
        // Fetch Profile and Latest ITR
        const profile = await TaxProfile.findOne({ user: userId });
        const itr = await IncomeTaxReturn.findOne({ user: userId }).sort({ createdAt: -1 });

        // Default State: New User
        let state = 'PROFILE_PENDING';
        let progress = 0;
        let nextStep = {
            label: 'Complete Profile',
            link: '/dashboard/profile',
            description: 'Set up your personal and tax details to get started.'
        };
        let status = { label: 'Not Started', color: 'gray' };

        // 1. Check Profile
        if (profile) {
            state = 'PROFILE_COMPLETED';
            progress = 25;
            nextStep = {
                label: 'Add Income',
                link: '/dashboard/income-tax',
                description: 'Enter your salary and other income sources.'
            };
            status = { label: 'Profile Ready', color: 'blue' };
        } else {
            return { state, progress, nextStep, status };
        }

        // 2. Check ITR Status / Income
        if (itr) {
            // Check if any income is recorded
            const hasIncome = (itr.income?.salary?.net > 0) || 
                              (itr.income?.otherSources > 0) || 
                              (itr.income?.houseProperty > 0);
            
            if (hasIncome) {
                state = 'INCOME_ADDED';
                progress = 50;
                nextStep = {
                    label: 'Claim Deductions',
                    link: '/dashboard/deductions',
                    description: 'Maximize your savings with 80C, 80D, and more.'
                };
                status = { label: 'In Progress', color: 'yellow' };
            }

            // 3. Check Deductions
            const hasDeductions = (itr.deductions?.section80C > 0) || 
                                  (itr.deductions?.standardDeduction > 0); // Standard deduction is default, maybe check custom ones?
                                  // Use calculated flag or simply check if we are beyond income stage
            
            if (hasIncome && hasDeductions && progress === 50) {
                 // Optimization: If user visited deductions page/logic (hard to track without flag), 
                 // but let's assume if we have income, we nudge for deductions.
                 // If status is 'calculated', we move forward.
            }

            // 4. Check Calculation / Filing Status
            if (itr.status === 'calculated' || itr.status === 'verified') {
                state = 'READY_TO_FILE';
                progress = 90;
                nextStep = {
                    label: 'File ITR',
                    link: '/dashboard/filing',
                    description: 'Review your return and submit to the IT department.'
                };
                status = { label: 'Ready to File', color: 'green' };
            }

            if (itr.status === 'filed' || itr.status === 'submitted') {
                state = 'FILED';
                progress = 100;
                nextStep = {
                    label: 'View Acknowledgement',
                    link: '/dashboard/documents',
                    description: 'Your tax return has been successfully filed.'
                };
                status = { label: 'Filed', color: 'purple' };
            }
        }

        return { state, progress, nextStep, status };

    } catch (error) {
        console.error('State Calculation Error:', error);
        throw error;
    }
};
