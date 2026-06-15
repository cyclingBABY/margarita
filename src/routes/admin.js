// --- UPDATED ANALYTICS ENDPOINTS ---

// Get occupancy stats including CONFIRMED and CHECKED-IN
router.get('/analytics/occupancy', async (req, res) => {
  try {
    const pool = getPool();
    
    // 1. Get total rooms
    const [totalRooms] = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const totalCount = totalRooms[0].count || 0;

    // 2. Count occupied/confirmed rooms for today [Fixes 0% Occupancy]
    const [occupied] = await pool.query(`
      SELECT COUNT(DISTINCT roomId) as count 
      FROM reservations 
      WHERE status IN ('checked-in', 'confirmed')
    `);
    const occupiedCount = occupied[0].count;

    // 3. Get trends for the chart
    const [reservationsByDay] = await pool.query(`
      SELECT DATE(createdAt) as date, COUNT(*) as count 
      FROM reservations 
      GROUP BY DATE(createdAt) 
      ORDER BY date ASC LIMIT 7
    `);

    res.json({
      totalRooms: totalCount,
      currentlyOccupied: occupiedCount,
      occupancyRate: totalCount > 0 ? Math.round((occupiedCount / totalCount) * 100) : 0,
      reservationsByDay
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});