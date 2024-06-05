export interface RegionLocation {
  id: string;
  name: string;
  strength: number
}

export interface Region {
  id: string;
  name: string;
  locations: RegionLocation[]
}

export const regions: Region[] = [
  {
    id: "it",
    name: "Italy",
    locations: [
      {
        id: 'milan1',
        name: "Milan",
        strength: 20
      },
      {
        id: 'milan2',
        name: "Milan",
        strength: 20
      }
    ]
  },
  {
    id: "uk",
    name: "United Kingdom",
    locations: [
      {
        id: "milan1",
        name: "Milan",
        strength: 20
      },
      {
        id: 'milan2',
        name: "Milan",
        strength: 20
      }
    ]
  }
]