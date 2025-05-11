import express from 'express';
import axios from 'axios';
import xml2js from 'xml2js';

const router = express.Router();

interface ArxivLink {
  attr?: {
    title?: string;
    href?: string;
    rel?: string;
    type?: string;
  };
}

interface ArxivAuthor {
  name?: string;
}

interface ArxivCategory {
  attr?: {
    term?: string;
  };
}

interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  published: string;
  author: ArxivAuthor | ArxivAuthor[];
  link: ArxivLink | ArxivLink[];
  category: ArxivCategory | ArxivCategory[];
}

/**
 * GET /api/arxiv/search
 * Searches the arXiv API for papers matching the query
 * Query parameters:
 * - query: string (required) - The search query
 * - start: number (optional) - Starting index for pagination (default: 0)
 * - max_results: number (optional) - Maximum results to return (default: 10)
 */
router.get('/search', async (req, res) => {
  try {
    const { query, start = 0, max_results = 10 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    // Format the arXiv API URL with search parameters
    const arxivUrl = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
      query as string
    )}&start=${start}&max_results=${max_results}`;
    
    console.log(`Querying arXiv API: ${arxivUrl}`);
    
    // Make the request to arXiv API
    const response = await axios.get(arxivUrl);
    
    // Parse XML response
    const parser = new xml2js.Parser({
      explicitArray: false,
      trim: true,
      normalize: true,
      normalizeTags: true,
      attrkey: 'attr',
    });
    
    const result = await parser.parseStringPromise(response.data);
    
    // Extract and format the papers from the response
    const entries = result.feed.entry || [];
    const papers = Array.isArray(entries) ? entries : [entries];
    
    // Transform the data to a more usable format for the frontend
    const formattedPapers = papers.map((paper: ArxivEntry) => {
      // Handle link array or single link object
      const links = Array.isArray(paper.link) ? paper.link : [paper.link].filter(Boolean);
      const pdfLink = links.find((link: ArxivLink) => link.attr?.title === 'pdf');

      return {
        id: paper.id,
        title: paper.title,
        summary: paper.summary,
        published: paper.published,
        authors: Array.isArray(paper.author) 
          ? paper.author.map(a => a.name).filter(Boolean)
          : (paper.author?.name ? [paper.author.name] : []),
        pdf_url: pdfLink?.attr?.href || '',
        arxiv_url: paper.id,
        categories: Array.isArray(paper.category) 
          ? paper.category.map(c => c.attr?.term).filter(Boolean)
          : (paper.category?.attr?.term ? [paper.category.attr.term] : []),
      };
    });
    
    res.json(formattedPapers);
  } catch (err) {
    console.error('Error searching arXiv:', err);
    
    let errorMessage = 'Failed to search arXiv';
    if (err instanceof Error) {
      errorMessage += `: ${err.message}`;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

export default router;