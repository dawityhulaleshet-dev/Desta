export interface DestaMember {
  id: string;
  name: string;
  generation: number;
  parentName: string | null;
  branchName: string | null;
  reviewRequired: boolean;
  notes?: string;
}

export interface FamilyNode {
  id?: string;
  name: string;
  generation?: number;
  parentName?: string | null;
  branchName?: string | null;
  reviewRequired?: boolean;
  children?: FamilyNode[];
}

/**
 * Authoritative master dataset of the Desta Family Lineage.
 * Total listed nodes: 168 (including documented placeholder slots and provisional nodes)
 * 8 Primary Branches radiating from Root Ancestor ደስታ
 * Depth: 5 Concentric Generations (G1 through G5)
 */
export const authoritativeDestaTree: FamilyNode = {
  id: "p001",
  name: "ደስታ",
  generation: 1,
  parentName: null,
  branchName: null,
  reviewRequired: false,
  children: [
    // 1. ስማኝ ደስታ
    {
      id: "b1",
      name: "ስማኝ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "ስማኝ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b1-g3-1",
          name: "አዮብ አንሳይ",
          generation: 3,
          parentName: "ስማኝ ደስታ",
          branchName: "ስማኝ ደስታ",
          reviewRequired: false
        }
      ]
    },

    // 2. መንግስቱ ደስታ
    {
      id: "b2",
      name: "መንግስቱ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "መንግስቱ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b2-g3-1",
          name: "ከበረን መንግስቱ",
          generation: 3,
          parentName: "መንግስቱ ደስታ",
          branchName: "መንግስቱ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b2-g4-1",
              name: "ይድም ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-1",
                  name: "[?]",
                  generation: 5,
                  parentName: "ይድም ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: true,
                  children: [
                    {
                      id: "b2-g6-1",
                      name: "ዮሃንስ ማንደፍሮ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "መንግስቱ ደስታ",
                      reviewRequired: false
                    },
                    {
                      id: "b2-g6-2",
                      name: "ሚካኤል ማንደፍሮ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "መንግስቱ ደስታ",
                      reviewRequired: false,
                      children: [
                        {
                          id: "b2-g7-1",
                          name: "ዳግማዊ ሚካኤል",
                          generation: 5,
                          parentName: "ሚካኤል ማንደፍሮ",
                          branchName: "መንግስቱ ደስታ",
                          reviewRequired: false
                        }
                      ]
                    },
                    {
                      id: "b2-g6-3",
                      name: "ህይወት… ማንደፍሮ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "መንግስቱ ደስታ",
                      reviewRequired: false
                    }
                  ]
                }
              ]
            },
            {
              id: "b2-g4-2",
              name: "አስፋው ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-2",
                  name: "ማራናታ አስፋው",
                  generation: 5,
                  parentName: "አስፋው ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-3",
              name: "አለባቸው ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-3",
                  name: "ሱራፌል አለባቸው",
                  generation: 5,
                  parentName: "አለባቸው ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-4",
              name: "አለም ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-4",
                  name: "ብሩክ ተስፋ",
                  generation: 5,
                  parentName: "አለም ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-5",
                  name: "ዮሴፍ ተስፋ",
                  generation: 5,
                  parentName: "አለም ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-5",
              name: "መላ ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-6",
                  name: "ኢያቤል መላ",
                  generation: 5,
                  parentName: "መላ ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-7",
                  name: "ሊያቤል መላ",
                  generation: 5,
                  parentName: "መላ ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-8",
                  name: "ካርቤኤል",
                  generation: 5,
                  parentName: "መላ ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-6",
              name: "አባይነህ ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-9",
                  name: "አማኑኤል",
                  generation: 5,
                  parentName: "አባይነህ ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-10",
                  name: "ቤተል",
                  generation: 5,
                  parentName: "አባይነህ ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-7",
              name: "መግቢር ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-11",
                  name: "ሚካኤል መግቢር",
                  generation: 5,
                  parentName: "መግቢር ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-8",
              name: "ብርሃንም ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-12",
                  name: "ማራናታ መላክ",
                  generation: 5,
                  parentName: "ብርሃንም ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-13",
                  name: "አማኑ መላክ",
                  generation: 5,
                  parentName: "ብርሃንም ከበረን",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-9",
              name: "አብርሃም ከበረን",
              generation: 4,
              parentName: "ከበረን መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b2-g3-2",
          name: "ጌቱ መንግስቱ",
          generation: 3,
          parentName: "መንግስቱ ደስታ",
          branchName: "መንግስቱ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b2-g4-10",
              name: "አያሌው ጌቱ",
              generation: 4,
              parentName: "ጌቱ መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-14",
                  name: "ብሩክ አያሌው",
                  generation: 5,
                  parentName: "አያሌው ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-15",
                  name: "በእምነት አያሌው",
                  generation: 5,
                  parentName: "አያሌው ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-16",
                  name: "አ… አያሌው",
                  generation: 5,
                  parentName: "አያሌው ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                }
              ]
            },
            {
              id: "b2-g4-11",
              name: "ማለኝ ጌቱ",
              generation: 4,
              parentName: "ጌቱ መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b2-g5-17",
                  name: "ታምራት ማለኝ",
                  generation: 5,
                  parentName: "ማለኝ ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-18",
                  name: "ሃና ማለኝ",
                  generation: 5,
                  parentName: "ማለኝ ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b2-g5-19",
                  name: "[ስም ያልተሞላ]",
                  generation: 5,
                  parentName: "ማለኝ ጌቱ",
                  branchName: "መንግስቱ ደስታ",
                  reviewRequired: true
                }
              ]
            }
          ]
        },
        {
          id: "b2-g3-3",
          name: "ይናው መንግስቱ",
          generation: 3,
          parentName: "መንግስቱ ደስታ",
          branchName: "መንግስቱ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b2-g4-12",
              name: "አስከንድር ይናው",
              generation: 4,
              parentName: "ይናው መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false
            },
            {
              id: "b2-g4-13",
              name: "[ስም ያልተሞላ]",
              generation: 4,
              parentName: "ይናው መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: true
            },
            {
              id: "b2-g4-14",
              name: "[ስም ያልተሞላ]",
              generation: 4,
              parentName: "ይናው መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: true
            },
            {
              id: "b2-g4-15",
              name: "ካርክ ይናው",
              generation: 4,
              parentName: "ይናው መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false
            },
            {
              id: "b2-g4-16",
              name: "ረዲኤት ይናው",
              generation: 4,
              parentName: "ይናው መንግስቱ",
              branchName: "መንግስቱ ደስታ",
              reviewRequired: false
            }
          ]
        }
      ]
    },

    // 3. ሳይኮን ደስታ
    {
      id: "b3",
      name: "ሳይኮን ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "ሳይኮን ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b3-g3-1",
          name: "ደምሰው ሳይኮን",
          generation: 3,
          parentName: "ሳይኮን ደስታ",
          branchName: "ሳይኮን ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b3-g4-1",
              name: "ይደግፍ ደምሰው",
              generation: 4,
              parentName: "ደምሰው ሳይኮን",
              branchName: "ሳይኮን ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b3-g5-1",
                  name: "[?]",
                  generation: 5,
                  parentName: "ይደግፍ ደምሰው",
                  branchName: "ሳይኮን ደስታ",
                  reviewRequired: true,
                  children: [
                    {
                      id: "b3-g6-1",
                      name: "ይታደስ ደረስ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "ሳይኮን ደስታ",
                      reviewRequired: false
                    },
                    {
                      id: "b3-g6-2",
                      name: "ቃልኪዳን ደረስ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "ሳይኮን ደስታ",
                      reviewRequired: false
                    },
                    {
                      id: "b3-g6-3",
                      name: "ሃይማሮ ደረስ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "ሳይኮን ደስታ",
                      reviewRequired: false
                    },
                    {
                      id: "b3-g6-4",
                      name: "ስንታየሁ ደረስ",
                      generation: 5,
                      parentName: "[?]",
                      branchName: "ሳይኮን ደስታ",
                      reviewRequired: false
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: "b3-g3-2",
          name: "እትርሳው ሳይኮን",
          generation: 3,
          parentName: "ሳይኮን ደስታ",
          branchName: "ሳይኮን ደስታ",
          reviewRequired: false
        },
        {
          id: "b3-g3-3",
          name: "ንጉሡ ሳይኮን",
          generation: 3,
          parentName: "ሳይኮን ደስታ",
          branchName: "ሳይኮን ደስታ",
          reviewRequired: false
        }
      ]
    },

    // 4. ዋለ ደስታ
    {
      id: "b4",
      name: "ዋለ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "ዋለ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b4-g3-1",
          name: "ከንዴ ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-1",
              name: "ህይወት ከንዴ",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-2",
              name: "[ስም ያልተሞላ]",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: true
            },
            {
              id: "b4-g4-3",
              name: "[ስም ያልተሞላ]",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: true
            },
            {
              id: "b4-g4-4",
              name: "አዜብ ከንዴ",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-5",
              name: "ቤተልሄም ከንዴ",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-6",
              name: "[ስም ያልተሞላ]",
              generation: 4,
              parentName: "ከንዴ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: true
            }
          ]
        },
        {
          id: "b4-g3-2",
          name: "ኤንደርጌ ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false
        },
        {
          id: "b4-g3-3",
          name: "ሃብታሙ ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-7",
              name: "የትነበርክ ሃብታሙ",
              generation: 4,
              parentName: "ሃብታሙ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b4-g3-4",
          name: "ግርማ ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-8",
              name: "ብሩክ ግርማ",
              generation: 4,
              parentName: "ግርማ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-9",
              name: "ኤልሳቤት ግርማ",
              generation: 4,
              parentName: "ግርማ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-10",
              name: "ናሆም ግርማ",
              generation: 4,
              parentName: "ግርማ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b4-g3-5",
          name: "የሺወርቅ ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-11",
              name: "ሃይማኖት ጀምበረ",
              generation: 4,
              parentName: "የሺወርቅ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-12",
              name: "ከበት ጀምበረ",
              generation: 4,
              parentName: "የሺወርቅ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-13",
              name: "አድማሱ ጀምበረ",
              generation: 4,
              parentName: "የሺወርቅ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-14",
              name: "ተዋህዶ ጀምበር",
              generation: 4,
              parentName: "የሺወርቅ ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b4-g3-6",
          name: "ምንትአምር ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-15",
              name: "እርስማወት",
              generation: 4,
              parentName: "ምንትአምር ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            },
            {
              id: "b4-g4-16",
              name: "መንግስት",
              generation: 4,
              parentName: "ምንትአምር ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false,
              children: [
                {
                  id: "b4-g5-1",
                  name: "በእምነት መንግስት",
                  generation: 5,
                  parentName: "መንግስት",
                  branchName: "ዋለ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b4-g5-2",
                  name: "ብርክት መንግስት",
                  generation: 5,
                  parentName: "መንግስት",
                  branchName: "ዋለ ደስታ",
                  reviewRequired: false
                }
              ]
            }
          ]
        },
        {
          id: "b4-g3-7",
          name: "ሰለሞን ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-17",
              name: "ጥበቡ ሰለሞን",
              generation: 4,
              parentName: "ሰለሞን ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b4-g3-8",
          name: "ማይሮን ዋለ",
          generation: 3,
          parentName: "ዋለ ደስታ",
          branchName: "ዋለ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b4-g4-18",
              name: "[?]",
              generation: 4,
              parentName: "ማይሮን ዋለ",
              branchName: "ዋለ ደስታ",
              reviewRequired: true,
              children: [
                {
                  id: "b4-g5-3",
                  name: "ማኝ ልቀ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "ዋለ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b4-g5-4",
                  name: "ለማነም ልቀ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "ዋለ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b4-g5-5",
                  name: "አቢሰማክ ልቀ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "ዋለ ደስታ",
                  reviewRequired: false
                }
              ]
            }
          ]
        }
      ]
    },

    // 5. አድማስ ደስታ
    {
      id: "b5",
      name: "አድማስ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "አድማስ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b5-g3-1",
          name: "አለምግንቼ አድማስ",
          generation: 3,
          parentName: "አድማስ ደስታ",
          branchName: "አድማስ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b5-g4-1",
              name: "[?]",
              generation: 4,
              parentName: "አለምግንቼ አድማስ",
              branchName: "አድማስ ደስታ",
              reviewRequired: true,
              children: [
                {
                  id: "b5-g5-1",
                  name: "ብሩክ አስፋው",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-2",
                  name: "ዮሃንስ አስፋው",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-3",
                  name: "አብርሃም አስፋው",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-4",
                  name: "[ስም ያልተሞላ]",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: true
                }
              ]
            }
          ]
        },
        {
          id: "b5-g3-2",
          name: "መጣልኝ አድማስ",
          generation: 3,
          parentName: "አድማስ ደስታ",
          branchName: "አድማስ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b5-g4-2",
              name: "[?]",
              generation: 4,
              parentName: "መጣልኝ አድማስ",
              branchName: "አድማስ ደስታ",
              reviewRequired: true,
              children: [
                {
                  id: "b5-g5-5",
                  name: "ቤዛዊት መጣልኝ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-6",
                  name: "ሰላማዊት መጣልኝ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-7",
                  name: "ዮሃንስ መጣልኝ",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                }
              ]
            }
          ]
        },
        {
          id: "b5-g3-3",
          name: "ይታየል አድማስ",
          generation: 3,
          parentName: "አድማስ ደስታ",
          branchName: "አድማስ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b5-g4-3",
              name: "[?]",
              generation: 4,
              parentName: "ይታየል አድማስ",
              branchName: "አድማስ ደስታ",
              reviewRequired: true,
              children: [
                {
                  id: "b5-g5-8",
                  name: "ገሊላ ይታየል",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                },
                {
                  id: "b5-g5-9",
                  name: "የአብስራ ይታየል",
                  generation: 5,
                  parentName: "[?]",
                  branchName: "አድማስ ደስታ",
                  reviewRequired: false
                }
              ]
            }
          ]
        }
      ]
    },

    // 6. አለማየሁ ደስታ
    {
      id: "b6",
      name: "አለማየሁ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "አለማየሁ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b6-g3-1",
          name: "መሰረት አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b6-g4-1",
              name: "አዝራ መሰረት",
              generation: 4,
              parentName: "መሰረት አለማየሁ",
              branchName: "አለማየሁ ደስታ",
              reviewRequired: false
            },
            {
              id: "b6-g4-2",
              name: "ዮሴፍ መሰረት",
              generation: 4,
              parentName: "መሰረት አለማየሁ",
              branchName: "አለማየሁ ደስታ",
              reviewRequired: false
            },
            {
              id: "b6-g4-3",
              name: "ቴዎድሮስ መሰረት",
              generation: 4,
              parentName: "መሰረት አለማየሁ",
              branchName: "አለማየሁ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b6-g3-2",
          name: "ዝድን አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false
        },
        {
          id: "b6-g3-3",
          name: "መልካም አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b6-g4-4",
              name: "ዳግም ሽመልስ",
              generation: 4,
              parentName: "መልካም አለማየሁ",
              branchName: "አለማየሁ ደስታ",
              reviewRequired: false
            },
            {
              id: "b6-g4-5",
              name: "ምህረት ሽመልስ",
              generation: 4,
              parentName: "መልካም አለማየሁ",
              branchName: "አለማየሁ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b6-g3-4",
          name: "ሩት አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false
        },
        {
          id: "b6-g3-5",
          name: "አሰፋ አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false
        },
        {
          id: "b6-g3-6",
          name: "አስመራ አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false
        },
        {
          id: "b6-g3-7",
          name: "ዮሃንስ አለማየሁ",
          generation: 3,
          parentName: "አለማየሁ ደስታ",
          branchName: "አለማየሁ ደስታ",
          reviewRequired: false
        }
      ]
    },

    // 7. ጤና ደስታ
    {
      id: "b7",
      name: "ጤና ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "ጤና ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b7-g3-1",
          name: "አበራ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-1",
              name: "ሰሎሜ አበራ",
              generation: 4,
              parentName: "አበራ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-2",
              name: "ራሄል አበራ",
              generation: 4,
              parentName: "አበራ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-3",
              name: "ሳሮን አበራ",
              generation: 4,
              parentName: "አበራ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-4",
              name: "አቤል አበራ",
              generation: 4,
              parentName: "አበራ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-2",
          name: "ተሾመ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-5",
              name: "ዮናታን ተሾመ",
              generation: 4,
              parentName: "ተሾመ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-6",
              name: "ዳንኤል ተሾመ",
              generation: 4,
              parentName: "ተሾመ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-7",
              name: "ሩት ተሾመ",
              generation: 4,
              parentName: "ተሾመ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-3",
          name: "ሙሉ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-8",
              name: "ድን አታለል",
              generation: 4,
              parentName: "ሙሉ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-9",
              name: "አቤ",
              generation: 4,
              parentName: "ሙሉ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-10",
              name: "ትእግስት",
              generation: 4,
              parentName: "ሙሉ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-11",
              name: "አስናቀች",
              generation: 4,
              parentName: "ሙሉ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-4",
          name: "አያሌው ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-12",
              name: "ቤተልሄም አያሌው",
              generation: 4,
              parentName: "አያሌው ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-13",
              name: "እየሩሳሌም አያሌው",
              generation: 4,
              parentName: "አያሌው ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-14",
              name: "አክሊል አያሌው",
              generation: 4,
              parentName: "አያሌው ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-15",
              name: "ዳግማዊ አያሌው",
              generation: 4,
              parentName: "አያሌው ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-5",
          name: "አሰፋ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-16",
              name: "ኤልሻዳይ አሰፋ",
              generation: 4,
              parentName: "አሰፋ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-17",
              name: "አሜን አሰፋ",
              generation: 4,
              parentName: "አሰፋ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-18",
              name: "አቤል አሰፋ",
              generation: 4,
              parentName: "አሰፋ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-6",
          name: "ብርሃኔ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-19",
              name: "ኤልያስ",
              generation: 4,
              parentName: "ብርሃኔ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-20",
              name: "ቢኒያም",
              generation: 4,
              parentName: "ብርሃኔ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-21",
              name: "አሮን",
              generation: 4,
              parentName: "ብርሃኔ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-7",
          name: "እታፈራሁ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-22",
              name: "አቤል ተሾመ",
              generation: 4,
              parentName: "እታፈራሁ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-23",
              name: "እልፍነሽ ተሾመ",
              generation: 4,
              parentName: "እታፈራሁ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-24",
              name: "ሰናይት ተሾመ",
              generation: 4,
              parentName: "እታፈራሁ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-8",
          name: "ታዬ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-25",
              name: "አቤል ታዬ",
              generation: 4,
              parentName: "ታዬ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-26",
              name: "ብርሃኑ ታዬ",
              generation: 4,
              parentName: "ታዬ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-27",
              name: "ትእግስት ታዬ",
              generation: 4,
              parentName: "ታዬ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-9",
          name: "አየለ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-28",
              name: "ዮሃንስ አየለ",
              generation: 4,
              parentName: "አየለ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-29",
              name: "ሄኖክ አየለ",
              generation: 4,
              parentName: "አየለ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-30",
              name: "ኤልያስ አየለ",
              generation: 4,
              parentName: "አየለ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b7-g3-10",
          name: "ታደሰ ጤና",
          generation: 3,
          parentName: "ጤና ደስታ",
          branchName: "ጤና ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b7-g4-31",
              name: "አማኑኤል ታደሰ",
              generation: 4,
              parentName: "ታደሰ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-32",
              name: "ሩት ታደሰ",
              generation: 4,
              parentName: "ታደሰ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            },
            {
              id: "b7-g4-33",
              name: "ናሆም ታደሰ",
              generation: 4,
              parentName: "ታደሰ ጤና",
              branchName: "ጤና ደስታ",
              reviewRequired: false
            }
          ]
        }
      ]
    },

    // 8. ሲራክ ደስታ
    {
      id: "b8",
      name: "ሲራክ ደስታ",
      generation: 2,
      parentName: "ደስታ",
      branchName: "ሲራክ ደስታ",
      reviewRequired: false,
      children: [
        {
          id: "b8-g3-1",
          name: "አደይ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-1",
              name: "ማህር",
              generation: 4,
              parentName: "አደይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-2",
              name: "አማን",
              generation: 4,
              parentName: "አደይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-3",
              name: "አያ",
              generation: 4,
              parentName: "አደይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-4",
              name: "ማሙ",
              generation: 4,
              parentName: "አደይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-5",
              name: "ትት",
              generation: 4,
              parentName: "አደይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-2",
          name: "ታደሰ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-6",
              name: "ቃልኪዳን ይሁን",
              generation: 4,
              parentName: "ታደሰ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-7",
              name: "በእምነት ይሁን",
              generation: 4,
              parentName: "ታደሰ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-3",
          name: "ወለተ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-8",
              name: "ሚኪያስ አስረስ",
              generation: 4,
              parentName: "ወለተ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-9",
              name: "ቢንያም አስረስ",
              generation: 4,
              parentName: "ወለተ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-10",
              name: "አቤኔዘር አስረስ",
              generation: 4,
              parentName: "ወለተ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-11",
              name: "ናኦል አስረስ",
              generation: 4,
              parentName: "ወለተ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-4",
          name: "ዘውዲቱ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-12",
              name: "እየሩሳሌም ተስፋ",
              generation: 4,
              parentName: "ዘውዲቱ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-13",
              name: "ኤልሻዳይ ተስፋ",
              generation: 4,
              parentName: "ዘውዲቱ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-14",
              name: "አቤል ተስፋ",
              generation: 4,
              parentName: "ዘውዲቱ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-5",
          name: "የሺ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-15",
              name: "ናሆም ወንደሰን",
              generation: 4,
              parentName: "የሺ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-16",
              name: "ኤልሳቤት ወንደሰን",
              generation: 4,
              parentName: "የሺ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-17",
              name: "አሮን ወንደሰን",
              generation: 4,
              parentName: "የሺ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-6",
          name: "ጌትነት ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-18",
              name: "ሚኪያስ ጌትነት",
              generation: 4,
              parentName: "ጌትነት ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-19",
              name: "በረከት ጌትነት",
              generation: 4,
              parentName: "ጌትነት ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-20",
              name: "ኤልያስ ጌትነት",
              generation: 4,
              parentName: "ጌትነት ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        },
        {
          id: "b8-g3-7",
          name: "መርጫይ ሲራክ",
          generation: 3,
          parentName: "ሲራክ ደስታ",
          branchName: "ሲራክ ደስታ",
          reviewRequired: false,
          children: [
            {
              id: "b8-g4-21",
              name: "ሃና መርጫይ",
              generation: 4,
              parentName: "መርጫይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-22",
              name: "ዘርባቤል መርጫይ",
              generation: 4,
              parentName: "መርጫይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            },
            {
              id: "b8-g4-23",
              name: "እመይ መርጫይ",
              generation: 4,
              parentName: "መርጫይ ሲራክ",
              branchName: "ሲራክ ደስታ",
              reviewRequired: false
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Flattens the hierarchical tree into the array of members with stable IDs and lineage attributes.
 */
export function flattenMasterTree(root: FamilyNode = authoritativeDestaTree): DestaMember[] {
  const result: DestaMember[] = [];
  let counter = 1;

  function traverse(node: FamilyNode, gen: number, parentName: string | null, branchName: string | null) {
    const id = node.id || `m${String(counter++).padStart(3, '0')}`;
    const effectiveBranch = gen === 1 ? null : (gen === 2 ? node.name : branchName);
    
    result.push({
      id,
      name: node.name,
      generation: gen,
      parentName,
      branchName: effectiveBranch,
      reviewRequired: node.name === '[?]' || node.name.includes('[ስም ያልተሞላ]') || !!node.reviewRequired
    });

    if (node.children) {
      node.children.forEach(child => {
        traverse(child, gen + 1, node.name, effectiveBranch);
      });
    }
  }

  traverse(root, 1, null, null);
  return result;
}

export const destaMembersDataset: DestaMember[] = flattenMasterTree(authoritativeDestaTree);
export const destaFamilyData: FamilyNode = authoritativeDestaTree;
