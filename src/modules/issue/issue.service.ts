import pool from "../../database/db";

export const insertIssue = async (title: string, description: string, type: string, reporterId: number) => {
  const result = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, type, reporterId]
  );
  return result.rows[0];
};

export const fetchAllIssues = async (sort: string, type?: string, status?: string) => {
  let query = "SELECT * FROM issues";
  const values: string[] = [];
  const conditions: string[] = [];

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  if (sort === "oldest") {
    query += " ORDER BY created_at ASC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  const result = await pool.query(query, values);
  const issues = result.rows;

  if (issues.length === 0) {
    return [];
  }

  // Fetch reporters manually as requested (no JOINs)
  const reporterIds = [...new Set(issues.map((issue) => issue.reporter_id).filter(id => id !== null))];
  
  let usersMap: Record<number, { id: number, name: string, role: string }> = {};
  if (reporterIds.length > 0) {
    const usersResult = await pool.query(`SELECT id, name, role FROM users WHERE id = ANY($1)`, [reporterIds]);
    for (const user of usersResult.rows) {
      usersMap[user.id] = user;
    }
  }

  const issuesWithReporters = issues.map((issue) => {
    const reporter = usersMap[issue.reporter_id] || null;
    const { reporter_id, ...issueData } = issue;
    return {
      ...issueData,
      reporter
    };
  });

  return issuesWithReporters;
};

export const fetchSingleIssue = async (id: string) => {
  const result = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
  const issue = result.rows[0];

  if (!issue) {
    return null;
  }

  let reporter = null;
  if (issue.reporter_id) {
    const userResult = await pool.query(`SELECT id, name, role FROM users WHERE id = $1`, [issue.reporter_id]);
    reporter = userResult.rows[0] || null;
  }

  const { reporter_id, ...issueData } = issue;
  return {
    ...issueData,
    reporter
  };
};

export const updateIssueData = async (id: string, title: string, description: string, type: string, status: string) => {
  const result = await pool.query(
    `UPDATE issues 
     SET title = $1, description = $2, type = $3, status = $4, updated_at = CURRENT_TIMESTAMP
     WHERE id = $5 RETURNING *`,
    [title, description, type, status, id]
  );
  return result.rows[0];
};

export const deleteIssueData = async (id: string) => {
  await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};
