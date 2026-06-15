const fs = require('fs');

// Fix GuestCRMView.tsx
const gPath = 'c:/xampp/htdocs/margarita/src/admin/views/GuestCRMView.tsx';
let g = fs.readFileSync(gPath, 'utf8');

// Fix 1: close the header div before grid
g = g.replace(
  '            className="pl-10 rounded-none h-12"\n          />\n        </div>\n\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">',
  '            className="pl-10 rounded-none h-12"\n          />\n        </div>\n      </div>\n\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
);

// Fix 2: close profile info div
g = g.replace(
  '                    <div className="flex gap-2 mt-3">\n                      <Badge className="rounded-none text-[10px]">Status: {selectedGuest.accountStatus}</Badge>\n                      <Badge className="rounded-none text-[10px]">Member since {new Date(selectedGuest.createdAt).toLocaleDateString()}</Badge>\n                    </div>\n                </div>',
  '                    <div className="flex gap-2 mt-3">\n                      <Badge className="rounded-none text-[10px]">Status: {selectedGuest.accountStatus}</Badge>\n                      <Badge className="rounded-none text-[10px]">Member since {new Date(selectedGuest.createdAt).toLocaleDateString()}</Badge>\n                    </div>\n                  </div>\n                </div>'
);

// Fix 3: close stats grid div
g = g.replace(
  '                      <div className="p-3 border border-hotel-blue/5 text-center">\n                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.feedback?.length || 0}</p>\n                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Feedback</p>\n                      </div>\n\n                    <div>',
  '                      <div className="p-3 border border-hotel-blue/5 text-center">\n                        <p className="text-2xl font-bold text-hotel-blue">{guestHistory.feedback?.length || 0}</p>\n                        <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Feedback</p>\n                      </div>\n                    </div>\n\n                    <div>'
);

// Fix 4: close reservations section div
g = g.replace(
  '                        {(!guestHistory.reservations || guestHistory.reservations.length === 0) && <p className="p-3 text-sm text-slate-400">No reservations found.</p>}\n                      </div>\n\n                    <div>',
  '                        {(!guestHistory.reservations || guestHistory.reservations.length === 0) && <p className="p-3 text-sm text-slate-400">No reservations found.</p>}\n                      </div>\n                    </div>\n\n                    <div>'
);

// Fix 5: close feedback section div and guestHistory div
g = g.replace(
  '                        {(!guestHistory.feedback || guestHistory.feedback.length === 0) && <p className="p-3 text-sm text-slate-400">No feedback yet.</p>}\n                      </div>\n                  </div>\n                )}',
  '                        {(!guestHistory.feedback || guestHistory.feedback.length === 0) && <p className="p-3 text-sm text-slate-400">No feedback yet.</p>}\n                      </div>\n                    </div>\n                  </div>\n                )}'
);

// Fix 6: close outer grid div and return div
g = g.replace(
  '        </Card>\n      </div>\n  );\n};',
  '        </Card>\n      </div>\n    </div>\n  );\n};'
);

fs.writeFileSync(gPath, g, 'utf8');
console.log('GuestCRMView.tsx fixed');

// Fix NotificationsView.tsx
const nPath = 'c:/xampp/htdocs/margarita/src/admin/views/NotificationsView.tsx';
let n = fs.readFileSync(nPath, 'utf8');

// Fix 1: close header div
n = n.replace(
  '        <Button\n          onClick={fetchNotifications}\n          variant="outline"\n          className="rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest"\n        >\n          Refresh\n        </Button>\n\n      <Card',
  '        <Button\n          onClick={fetchNotifications}\n          variant="outline"\n          className="rounded-none border-hotel-blue/10 text-[10px] uppercase font-bold tracking-widest"\n        >\n          Refresh\n        </Button>\n      </div>\n\n      <Card'
);

// Fix 2: close notifications list div
n = n.replace(
  '                ))}\n              </div>\n            )}\n          </ScrollArea>',
  '                ))}\n              </div>\n            )}\n          </ScrollArea>\n        </CardContent>\n      </Card>'
);

// Fix 3: close outer div
n = n.replace(
  '      </Card>\n  );\n};',
  '    </div>\n  );\n};'
);

fs.writeFileSync(nPath, n, 'utf8');
console.log('NotificationsView.tsx fixed');
