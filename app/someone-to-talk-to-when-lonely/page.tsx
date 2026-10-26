import type { Metadata } from 'next'
import ReadyToTalkLanding, { type ReadyToTalkLandingData } from '@/app/components/ReadyToTalkLanding'

const data: ReadyToTalkLandingData = {
  "canonical": "/someone-to-talk-to-when-lonely",
  "title": "Someone to Talk to When You're Lonely | How Was Your Day",
  "description": "Feeling lonely and want someone to talk to? How Was Your Day connects you with real peer listeners for private one-to-one conversations. Start with an 8-minute session.",
  "keywords": [
    "someone to talk to when lonely",
    "Someone to Talk to When You're Lonely",
    "peer support",
    "someone to talk to",
    "talk to a real person online"
  ],
  "eyebrow": "Human conversation · Ready to talk",
  "h1": "Lonely right now? Find someone to talk to.",
  "intro": "Loneliness does not always mean you have nobody around. Sometimes it means you want one person who will actually listen. How Was Your Day gives you a private way to start that human conversation.",
  "problemTitle": "You can be surrounded by people and still feel alone",
  "problem": [
    "You can have a partner, family, colleagues and a full contact list and still reach a moment when you do not know who you can honestly talk to. Loneliness is often about the quality of connection, not simply the number of people around you.",
    "If you want company, a place to vent or someone who will listen without needing anything from you, a one-to-one peer conversation is one option."
  ],
  "humanTitle": "Why another human can feel different",
  "human": [
    "Reciprocity — A conversation happens between two people, with a real person responding to what you say.",
    "Attention — You can focus on one conversation instead of trying to perform being okay for a whole social group.",
    "Shared experience — You can choose a listener whose profile includes experiences relevant to yours.",
    "Connection without social history — Sometimes a person outside your everyday circle is easier to talk to."
  ],
  "whyTitle": "Why How Was Your Day fits this moment",
  "why": [
    "How Was Your Day is built around one-to-one peer support. It is not positioned as therapy, counselling or an AI companion.",
    "You choose a listener rather than receiving a generic response. The goal is a human conversation where you can talk, vent, reflect or simply not feel alone for a while.",
    "You can start without committing to a long programme: sessions start at 8 minutes, followed by paid time only if you choose to continue."
  ],
  "fitTitle": "A conversation may be useful when…",
  "fit": [
    "You are alone at home and want another human voice or chat.",
    "You have people around you but nobody you want to tell the whole story to.",
    "You moved cities or countries and miss familiar connection.",
    "You are going through a breakup or relationship distance.",
    "You want to talk without worrying that you are burdening a friend.",
    "You simply want company for a difficult stretch."
  ],
  "faq": [
    {
      "q": "Is How Was Your Day therapy?",
      "a": "No. How Was Your Day is peer support and human connection. It is not a substitute for qualified mental-health professionals or clinical treatment."
    },
    {
      "q": "Can I talk by text instead of voice?",
      "a": "Yes. How Was Your Day supports one-to-one text or voice conversations, depending on what is available with the listener you choose."
    },
    {
      "q": "How much does it cost?",
      "a": "New seekers can start with an 8-minute session. Paid sessions currently start at £4.20 for 8 minutes, with the applicable price shown before you continue."
    },
    {
      "q": "Do I have to explain everything before starting?",
      "a": "No. You can start simply. You decide what to share and how much context to give."
    },
    {
      "q": "How do I start?",
      "a": "Open Browse, review listener profiles and choose someone who feels relevant. Start with an 8-minute session."
    }
  ],
  "related": [
    {
      "href": "/talk",
      "label": "Talk to someone now"
    },
    {
      "href": "/how-it-works",
      "label": "How it works"
    },
    {
      "href": "/peer-support",
      "label": "What is peer support?"
    },
    {
      "href": "/peer-support-vs-therapy",
      "label": "Therapy vs peer support"
    }
  ]
}

export const metadata: Metadata = { title: data.title, description: data.description, keywords: data.keywords, alternates: { canonical: 'https://www.howwasyourday.live'+data.canonical }, openGraph: { title: data.title, description: data.description, url: 'https://www.howwasyourday.live'+data.canonical, siteName: 'How Was Your Day', type: 'website' } }

export default function Page() { return <ReadyToTalkLanding data={data} /> }
