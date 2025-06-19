// =============================================================================
// ENHANCED SEARCH-DRIVEN PERSONALIZATION SYSTEM
// =============================================================================

/**
 * Advanced Research Orchestrator - Conducts multiple parallel searches for deep personalization
 * This replaces the basic single search with a comprehensive multi-layered approach
 */
async function performAdvancedClientResearch(clientName, serviceType) {
    const searches = [
        {
            type: 'company_profile',
            prompt: `@agent Research ${clientName}: company size, revenue, key executives, recent news, strategic initiatives, and business model. Focus on current priorities and growth areas.`,
            color: 'blue',
            weight: 'high'
        },
        {
            type: 'industry_context',
            prompt: `@agent Research ${clientName}'s industry: current trends, digital transformation patterns, common challenges, emerging technologies, and market pressures affecting similar companies.`,
            color: 'indigo',
            weight: 'high'
        },
        {
            type: 'technology_landscape',
            prompt: `@agent Research ${clientName}'s technology stack, recent tech investments, digital initiatives, system integrations, and technology partnerships. Focus on ${serviceType} readiness.`,
            color: 'green',
            weight: 'medium'
        },
        {
            type: 'competitive_analysis',
            prompt: `@agent Research ${clientName}'s main competitors and their approach to ${serviceType}. What competitive advantages could our solution provide?`,
            color: 'purple',
            weight: 'medium'
        },
        {
            type: 'compliance_requirements',
            prompt: `@agent Research regulatory and compliance requirements for ${clientName}'s industry that would impact ${serviceType} implementation, data handling, and security.`,
            color: 'orange',
            weight: 'low'
        }
    ];

    const results = {};
    let searchProgress = 0;
    const totalSearches = searches.length;
    
    // Update progress indicator
    addToResearchLog('🧠 Advanced Research Initiated', 
        `Conducting ${totalSearches} specialized research queries to create highly personalized SOW...`, 'blue');
    
    for (const search of searches) {
        try {
            searchProgress++;
            addToResearchLog(`🔍 ${search.type.replace('_', ' ').toUpperCase()} (${searchProgress}/${totalSearches})`, 
                `Analyzing ${search.type.replace('_', ' ')} for ${clientName}...`, search.color);
            
            // Stagger requests to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const result = await Promise.race([
                callAnythingLLM(search.prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`${search.type} search timed out`)), 45000)
                )
            ]);
            
            results[search.type] = {
                data: result,
                weight: search.weight,
                timestamp: new Date()
            };
            
            updateLastLogEntry(`✅ ${search.type.replace('_', ' ').toUpperCase()} Complete`, 
                result.substring(0, 150) + '...', search.color);
            
            // Clean exit from agent mode
            try {
                await callAnythingLLM('/exit');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                console.log("Agent exit handled");
            }
            
        } catch (error) {
            console.warn(`${search.type} research failed:`, error);
            results[search.type] = {
                data: `Research incomplete due to: ${error.message}`,
                weight: 'error',
                timestamp: new Date()
            };
            updateLastLogEntry(`❌ ${search.type.replace('_', ' ').toUpperCase()} Failed`, 
                `Unable to complete research: ${error.message}`, 'red');
        }
    }
    
    addToResearchLog('🎯 Research Analysis Complete', 
        `Advanced research completed. Generating personalized insights and recommendations...`, 'green');
    
    return results;
}

/**
 * Enhanced Service Research with Implementation Methodology Analysis
 */
async function performAdvancedServiceResearch(serviceType, clientIndustry = '') {
    const serviceSearches = [
        {
            type: 'best_practices',
            prompt: `@agent Research best practices for ${serviceType} implementation: methodology, phases, success factors, common pitfalls, and industry standards. Include timeline estimates.`,
            color: 'purple'
        },
        {
            type: 'industry_specific',
            prompt: `@agent Research ${serviceType} implementation specifically for ${clientIndustry} industry: unique considerations, compliance requirements, and specialized approaches.`,
            color: 'indigo'
        },
        {
            type: 'roi_metrics',
            prompt: `@agent Research ROI metrics and success measurements for ${serviceType} projects: KPIs, benchmarks, and expected outcomes that justify investment.`,
            color: 'green'
        },
        {
            type: 'resource_requirements',
            prompt: `@agent Research typical resource requirements for ${serviceType}: team structure, skill sets, tools needed, and role-specific hour estimates.`,
            color: 'blue'
        }
    ];

    const results = {};
    
    for (const search of serviceSearches) {
        try {
            addToResearchLog(`🛠️ ${search.type.replace('_', ' ').toUpperCase()}`, 
                `Researching ${search.type.replace('_', ' ')} for ${serviceType}...`, search.color);
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const result = await Promise.race([
                callAnythingLLM(search.prompt),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`${search.type} search timed out`)), 45000)
                )
            ]);
            
            results[search.type] = result;
            updateLastLogEntry(`✅ ${search.type.replace('_', ' ').toUpperCase()} Complete`, 
                result.substring(0, 150) + '...', search.color);
            
            try {
                await callAnythingLLM('/exit');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (e) {
                console.log("Agent exit handled");
            }
            
        } catch (error) {
            console.warn(`${search.type} research failed:`, error);
            results[search.type] = `Unable to complete ${search.type} research: ${error.message}`;
        }
    }
    
    return results;
}

/**
 * Intelligent Personalization Engine - Creates hyper-personalized SOW content
 */
function generatePersonalizedSOWContent(clientName, serviceType, clientResearch, serviceResearch, projectBrief) {
    const personalization = {
        executiveSummary: '',
        riskMitigation: [],
        opportunities: [],
        customizedApproach: [],
        pricingJustification: '',
        timelineOptimization: '',
        successMetrics: [],
        stakeholderConsiderations: []
    };

    // Generate Executive Summary with personalized context
    personalization.executiveSummary = `This Statement of Work outlines Social Garden's strategic approach to delivering ${serviceType} services specifically tailored for ${clientName}. Based on our comprehensive research analysis, we have identified key opportunities and optimized our methodology to align with your organization's unique requirements, industry context, and strategic objectives.`;

    // Extract opportunities from research
    if (clientResearch.company_profile?.data) {
        personalization.opportunities.push(`Leverage ${clientName}'s current initiatives for enhanced project synergy`);
    }

    if (clientResearch.industry_context?.data) {
        personalization.opportunities.push(`Capitalize on industry trends to maximize competitive advantage`);
    }

    if (clientResearch.technology_landscape?.data) {
        personalization.opportunities.push(`Optimize integration with existing technology investments`);
    }

    // Risk mitigation based on research
    if (clientResearch.compliance_requirements?.data) {
        personalization.riskMitigation.push(`Proactive compliance framework addressing industry-specific requirements`);
    }

    if (serviceResearch.best_practices) {
        personalization.riskMitigation.push(`Proven methodology based on industry best practices and lessons learned`);
    }

    // Customized approach
    if (serviceResearch.industry_specific) {
        personalization.customizedApproach.push(`Industry-specific implementation approach tailored for your sector`);
    }

    if (clientResearch.competitive_analysis?.data) {
        personalization.customizedApproach.push(`Competitive differentiation strategy based on market analysis`);
    }

    // Success metrics from ROI research
    if (serviceResearch.roi_metrics) {
        personalization.successMetrics.push(`Industry-benchmarked KPIs and success measurements`);
        personalization.successMetrics.push(`ROI tracking aligned with your business objectives`);
    }

    // Pricing justification
    if (clientResearch.company_profile?.data && serviceResearch.resource_requirements) {
        personalization.pricingJustification = `Our pricing reflects the specialized expertise required for your unique requirements, competitive market rates, and value delivered through our research-driven approach.`;
    }

    return personalization;
}

/**
 * Dynamic Content Adaptation - Adapts SOW sections based on research insights
 */
function adaptSOWContentBasedOnResearch(personalizedContent, clientResearch, serviceResearch) {
    const adaptations = {
        objectives: [],
        deliverables: [],
        scopeItems: [],
        additionalConsiderations: []
    };

    // Generate research-driven objectives
    if (clientResearch.industry_context?.data) {
        adaptations.objectives.push(`Address industry-specific challenges identified in our research analysis`);
    }

    if (clientResearch.competitive_analysis?.data) {
        adaptations.objectives.push(`Establish competitive advantages through strategic implementation approach`);
    }

    if (serviceResearch.roi_metrics) {
        adaptations.objectives.push(`Achieve measurable ROI through industry-benchmarked success metrics`);
    }

    // Research-driven deliverables
    if (clientResearch.technology_landscape?.data) {
        adaptations.deliverables.push(`Technology integration assessment and compatibility analysis`);
    }

    if (clientResearch.compliance_requirements?.data) {
        adaptations.deliverables.push(`Compliance framework and regulatory alignment documentation`);
    }

    if (serviceResearch.best_practices) {
        adaptations.deliverables.push(`Best practices implementation guide specific to your industry`);
    }

    // Enhanced scope items
    if (clientResearch.company_profile?.data) {
        adaptations.scopeItems.push(`Stakeholder analysis and organizational change management`);
    }

    if (serviceResearch.industry_specific) {
        adaptations.scopeItems.push(`Industry-specific customization and optimization`);
    }

    // Additional considerations
    if (clientResearch.technology_landscape?.data) {
        adaptations.additionalConsiderations.push(`Existing technology stack integration requirements`);
    }

    if (clientResearch.compliance_requirements?.data) {
        adaptations.additionalConsiderations.push(`Regulatory compliance and security considerations`);
    }

    return adaptations;
}

/**
 * Research-Driven Pricing Optimization
 */
function optimizePricingBasedOnResearch(clientResearch, serviceResearch, baseHours) {
    const pricingFactors = {
        complexityMultiplier: 1.0,
        riskMultiplier: 1.0,
        valueMultiplier: 1.0,
        timelineMultiplier: 1.0
    };

    // Adjust complexity based on technology landscape
    if (clientResearch.technology_landscape?.data.includes('complex') || 
        clientResearch.technology_landscape?.data.includes('legacy')) {
        pricingFactors.complexityMultiplier = 1.2;
    }

    // Adjust risk based on compliance requirements
    if (clientResearch.compliance_requirements?.data.includes('strict') || 
        clientResearch.compliance_requirements?.data.includes('regulated')) {
        pricingFactors.riskMultiplier = 1.15;
    }

    // Adjust value based on company size and industry
    if (clientResearch.company_profile?.data.includes('enterprise') || 
        clientResearch.company_profile?.data.includes('Fortune')) {
        pricingFactors.valueMultiplier = 1.1;
    }

    // Calculate optimized hours
    const totalMultiplier = pricingFactors.complexityMultiplier * 
                           pricingFactors.riskMultiplier * 
                           pricingFactors.valueMultiplier * 
                           pricingFactors.timelineMultiplier;

    return {
        optimizedHours: Math.round(baseHours * totalMultiplier),
        justification: `Pricing optimized based on complexity analysis, risk assessment, and value alignment from our comprehensive research.`,
        factors: pricingFactors
    };
}

// =============================================================================
// INTEGRATION FUNCTIONS FOR EXISTING SOW GENERATOR
// =============================================================================

/**
 * Enhanced version of the existing performClientResearch function
 */
async function performEnhancedClientResearch() {
    const clientName = clientNameInput.value.trim();
    const serviceType = serviceResearchInput.value.trim() || 'digital transformation';
    
    if (!clientName) {
        alert('Please enter a client name to research.');
        return;
    }

    // Update UI state
    clientSearchBtn.disabled = true;
    clientSearchLoading.classList.remove('hidden');
    clientResearchStep.classList.add('active');

    try {
        // Perform advanced multi-layered research
        const advancedResearch = await performAdvancedClientResearch(clientName, serviceType);
        
        // Store research data globally
        window.advancedClientData = advancedResearch;
        clientData = Object.values(advancedResearch).map(r => r.data || r).join('\n\n');
        
        // Generate personalization insights
        const insights = generatePersonalizedSOWContent(clientName, serviceType, advancedResearch, {}, '');
        window.personalizationInsights = insights;
        
        addToResearchLog('🎯 Advanced Research Complete', 
            `Comprehensive client analysis completed with personalization insights generated. Ready for enhanced SOW creation.`, 'green');

        // Mark step as completed
        clientResearchStep.classList.remove('active');
        clientResearchStep.classList.add('completed');
        
    } catch (error) {
        console.error('Enhanced client research failed:', error);
        addToResearchLog('❌ Research Failed', 
            `Advanced research encountered an error: ${error.message}. Falling back to basic research mode.`, 'red');
        
        // Fallback to basic research
        await performBasicClientResearch(clientName);
    } finally {
        clientSearchBtn.disabled = false;
        clientSearchLoading.classList.add('hidden');
    }
}

/**
 * Enhanced version of the existing performServiceResearch function
 */
async function performEnhancedServiceResearch() {
    const serviceType = serviceResearchInput.value.trim();
    const clientName = clientNameInput.value.trim();
    
    if (!serviceType) {
        alert('Please enter a service type to research.');
        return;
    }

    // Update UI state
    serviceSearchBtn.disabled = true;
    serviceSearchLoading.classList.remove('hidden');
    serviceResearchStep.classList.add('active');

    try {
        // Extract industry from client research if available
        let clientIndustry = '';
        if (window.advancedClientData?.industry_context?.data) {
            clientIndustry = window.advancedClientData.industry_context.data.split(' ')[0];
        }
        
        // Perform advanced service research
        const advancedServiceResearch = await performAdvancedServiceResearch(serviceType, clientIndustry);
        
        // Store research data globally
        window.advancedServiceData = advancedServiceResearch;
        serviceData = Object.values(advancedServiceResearch).join('\n\n');
        
        addToResearchLog('🛠️ Service Research Complete', 
            `Comprehensive service analysis completed with best practices, ROI metrics, and resource requirements identified.`, 'purple');

        // Mark step as completed
        serviceResearchStep.classList.remove('active');
        serviceResearchStep.classList.add('completed');
        
    } catch (error) {
        console.error('Enhanced service research failed:', error);
        addToResearchLog('❌ Service Research Failed', 
            `Service research encountered an error: ${error.message}. Falling back to basic research mode.`, 'red');
        
        // Fallback to basic research
        await performBasicServiceResearch(serviceType);
    } finally {
        serviceSearchBtn.disabled = false;
        serviceSearchLoading.classList.add('hidden');
    }
}

/**
 * Enhanced SOW generation with personalization
 */
async function generateEnhancedSOW() {
    const brief = clientBrief.value.trim();
    const clientName = clientNameInput.value.trim();
    const serviceType = serviceResearchInput.value.trim();

    if (!brief) {
        alert('Please enter a detailed brief before generating the scope.');
        return;
    }

    generateBtn.disabled = true;
    finalLoading.classList.remove('hidden');
    briefStep.classList.add('active');

    try {
        // Use advanced research data if available
        const clientResearch = window.advancedClientData || {};
        const serviceResearch = window.advancedServiceData || {};
        const personalizationInsights = window.personalizationInsights || {};
        
        // Generate personalized content
        const personalizedContent = generatePersonalizedSOWContent(
            clientName, serviceType, clientResearch, serviceResearch, brief
        );
        
        // Adapt SOW content based on research
        const adaptedContent = adaptSOWContentBasedOnResearch(
            personalizedContent, clientResearch, serviceResearch
        );
        
        // Create comprehensive SOW prompt with all research insights
        const enhancedPrompt = `Create a highly personalized Statement of Work using this research data:

CLIENT: ${clientName}
SERVICE: ${serviceType}
BRIEF: ${brief}

PERSONALIZATION INSIGHTS:
${JSON.stringify(personalizedContent, null, 2)}

ADAPTED CONTENT:
${JSON.stringify(adaptedContent, null, 2)}

Generate a comprehensive SOW with:
1. Personalized executive summary
2. Research-driven objectives (${adaptedContent.objectives.join(', ')})
3. Custom deliverables (${adaptedContent.deliverables.join(', ')})
4. Tailored scope items (${adaptedContent.scopeItems.join(', ')})
5. Realistic hour estimates for: Tech Sr. Consultant ($295/hr), Tech Specialist ($180/hr), Project Coordination ($110/hr), Account Management ($210/hr)

Make it highly specific to ${clientName} based on the research insights.`;

        // Generate SOW with enhanced prompt
        const sowResponse = await callAnythingLLM(enhancedPrompt);
        
        // Parse and render the enhanced SOW
        const sowData = parseSOWResponse(sowResponse);
        renderCompleteSOW(sowData);
        
        // Show personalization insights in the UI
        displayPersonalizationInsights(personalizedContent, adaptedContent);
        
        addToResearchLog('🎉 Enhanced SOW Generated', 
            `Highly personalized SOW created using comprehensive research insights and intelligent content adaptation.`, 'green');

    } catch (error) {
        console.error('Enhanced SOW generation failed:', error);
        addToResearchLog('❌ SOW Generation Failed', 
            `Error generating enhanced SOW: ${error.message}`, 'red');
    } finally {
        generateBtn.disabled = false;
        finalLoading.classList.add('hidden');
    }
}

/**
 * Display personalization insights in the research insights section
 */
function displayPersonalizationInsights(personalizedContent, adaptedContent) {
    const insightsSection = document.getElementById('research-insights');
    if (!insightsSection) return;
    
    insightsSection.innerHTML = `
        <h3 class="font-semibold text-lg mb-3 text-blue-800">🧠 AI-Driven Personalization Applied</h3>
        <div class="space-y-4 text-sm">
            <div class="bg-white p-3 rounded border">
                <strong class="text-blue-700">Research-Based Opportunities:</strong>
                <ul class="mt-1 list-disc list-inside text-blue-600">
                    ${personalizedContent.opportunities.map(opp => `<li>${opp}</li>`).join('')}
                </ul>
            </div>
            <div class="bg-white p-3 rounded border">
                <strong class="text-blue-700">Risk Mitigation Strategies:</strong>
                <ul class="mt-1 list-disc list-inside text-blue-600">
                    ${personalizedContent.riskMitigation.map(risk => `<li>${risk}</li>`).join('')}
                </ul>
            </div>
            <div class="bg-white p-3 rounded border">
                <strong class="text-blue-700">Customized Approach:</strong>
                <ul class="mt-1 list-disc list-inside text-blue-600">
                    ${personalizedContent.customizedApproach.map(approach => `<li>${approach}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
    
    insightsSection.style.display = 'block';
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performEnhancedClientResearch,
        performEnhancedServiceResearch,
        generateEnhancedSOW,
        performAdvancedClientResearch,
        performAdvancedServiceResearch,
        generatePersonalizedSOWContent,
        adaptSOWContentBasedOnResearch,
        optimizePricingBasedOnResearch
    };
}
