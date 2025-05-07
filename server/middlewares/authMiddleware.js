export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.flash('error', 'Please login first');
      return res.redirect('/login');
    }
    next();
  };
  
  export const requireTeacher = (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== 'teacher') {
      req.flash('error', 'Teacher access required');
      return res.redirect('/login');
    }
    next();
  };