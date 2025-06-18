---
layout: page
---
<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/thomasbarkats.png',
    name: 'Thomas Barkats',
    title: 'Fondateur & Architecte Principal',
    desc: 'A initié YasuiJS et dirigé son développement en solo. A conçu l\'architecture et les concepts de base.',
    links: [
      { icon: 'github', link: 'https://github.com/thomasbarkats' },
    ]
  },
  {
    avatar: 'https://www.github.com/alexandre-hallaine.png',
    name: 'Alexandre Hallaine',
    title: 'Développeur Principal',
    desc: 'A rejoint le projet en 2025 pour moderniser avec des outils à jour.',
    links: [
      { icon: 'github', link: 'https://github.com/alexandre-hallaine' },
    ]
  },
]
</script>

<VPTeamPage>
  <VPTeamPageTitle>
    <template #title>
      Notre Équipe
    </template>
    <template #lead>
      Le développement de YasuiJS est guidé par une équipe internationale,
      dont certains ont choisi d'être présentés ci-dessous.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers :members />
</VPTeamPage>
