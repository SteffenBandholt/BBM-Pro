export function buildDebugProtocolData() {
  const projectId = "proj-debug";
  const meetingId = "meet-debug";
  return {
    mode: "protocol",
    project: { id: projectId, name: "Debug Projekt", number: "P-2026", city: "Berlin" },
    meeting: {
      id: meetingId,
      title: "Wöchentliche Baubesprechung",
      index: 5,
      is_closed: true,
      created_at: "2026-04-01T08:00:00Z",
      updated_at: "2026-04-01T09:30:00Z",
    },
    participants: Array.from({ length: 18 }).map((_, i) => ({
      kind: "firm",
      firmId: `firm-${i + 1}`,
      firmName: `Firma ${i + 1} mit langem Namen GmbH`,
      isPresent: i % 2 === 0,
      isInDistribution: i % 3 === 0,
    })),
    tops: [
      {
        id: "t1",
        level: 1,
        displayNumber: "1",
        title: "Ein sehr langer TOP-Titel der sicher umbricht und damit die neue Zeilenlogik testet",
        longtext:
          "Langtext Zeile 1 mit reichlich Inhalt. Noch mehr Worte um sicherzugehen, dass der Umbruch funktioniert und keine Zeilen abgeschnitten werden. Zweite Zeile mit weiterem Kontext. Dritte Zeile.",
        status: "offen",
        dueDate: "2026-04-15",
        responsibleLabel: "Firma 1",
        ampelColor: "orange",
        children: [
          {
            id: "t1.1",
            level: 2,
            displayNumber: "1.1",
            title: "Unterpunkt mit mittelgroßem Titel",
            longtext: "Kurztext ohne große Überraschungen.",
            status: "verzug",
            dueDate: "2026-04-05",
            responsibleLabel: "Firma 2",
            ampelColor: "rot",
            children: [],
          },
        ],
      },
      {
        id: "t2",
        level: 1,
        displayNumber: "2",
        title: "Erledigt, übernommen, grau darzustellen",
        longtext: "Keine weiteren Aktionen nötig.",
        status: "erledigt",
        dueDate: "2026-03-28",
        responsibleLabel: "Firma 3",
        ampelColor: "gruen",
        isCarriedOver: true,
        children: [],
      },
    ],
  };
}
