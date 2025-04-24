export const botConfig = {
  name: "AAIMS BOT",
  language: "sv-SE",
  voiceId: "sv-SE-Standard-A", // Anpassa för önskad röst
  personality: {
    style: "professional",
    formality: "semi-formal",
    helpfulness: "high"
  },
  triggers: {
    nameCall: ["hej aaims", "aaims", "bot"],
    handRaise: {
      uncertainty: 0.7,    // Hur säker boten ska vara innan den räcker upp handen
      maxInterruptions: 3  // Max antal gånger per möte
    }
  },
  responses: {
    introduction: "Mitt namn är BOT, AAIMS BOT",
    clarification: "Ursäkta, kan du förtydliga vad du menade med...",
    suggestion: "Om jag får komma med ett förslag..."
  },

  contextManagement: {
    memory: {
      shortTerm: 1000,    // Antal ord att komma ihåg från aktuellt möte
      longTerm: {
        meetings: 10,      // Antal tidigare möten att ha kontext från
        keyPoints: 50      // Antal viktiga punkter per möte
      }
    },
    learning: {
      adaptToParticipants: true,  // Anpassa tonläge efter deltagare
      rememberPreferences: true,   // Kom ihåg deltagarpreferenser
      improvementRate: 0.2         // Hur snabbt boten anpassar sig
    }
  },

  meetingAwareness: {
    trackAgenda: true,           // Följ dagordningen
    timeManagement: {
      warnTimeLimit: 0.8,        // Varna när 80% av tiden gått
      suggestTimeAdjustment: true
    },
    participantTracking: {
      ensureParticipation: true, // Uppmuntra tysta deltagare
      balanceDiscussion: true    // Balansera samtalstid
    }
  },

  interaction: {
    proactiveMode: {
      enabled: true,
      triggers: {
        uncertainty: 0.6,        // När gruppen verkar osäker
        conflict: 0.7,           // Vid meningsskiljaktigheter
        confusion: 0.8,          // När något behöver förtydligas
        opportunity: 0.5         // För att bidra med relevant information
      }
    },
    voice: {
      useEmphasis: true,        // Variera tonläge för viktiga punkter
      speedAdjustment: true,    // Anpassa talhastighet efter situation
      emotionalAwareness: true  // Anpassa röstton efter mötets stämning
    }
  },

  integration: {
    // Notera: Det finns möjlighet att integrera med Outlook-kalendrar
    // genom att använda Microsoft Graph API och Azure AD autentisering.
    // Detta kräver:
    // 1. Registrering av appen i Azure AD
    // 2. Konfiguration av OAuth2 med Microsoft
    // 3. Tillstånd från organisationen
    // 4. Korrekt hantering av kalendertillstånd
    // Se dokumentation i /src/app/api/outlook-calendar/route.js
    calendar: {
      providers: ['google'],  // Kan utökas med 'outlook' vid behov
      syncEnabled: false      // Aktivera synkronisering mellan kalendrar
    }
  }
};
