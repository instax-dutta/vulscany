# Aeglyn Development Setup

## Repository Structure

**Main Application** (This Device)
- Repository: `vulscany` (GitHub: instax-dutta/vulscany)
- Deployment: `app.aeglyn.site`
- Managed: On this device

**Landing Page** (Different Device)
- Repository: `aeglyn-landing-v1` (GitHub: instax-dutta/aeglyn-landing-v1)
- Deployment: `aeglyn.site`
- Managed: On a different device

## Syncing Landing Page for Development

When you need to test cross-site linking or check landing page updates:

```powershell
# Check landing page status
.\sync-landing.ps1 status

# Pull latest changes from landing page
.\sync-landing.ps1 pull

# Show help
.\sync-landing.ps1 help
```

The script will:
- Clone the landing page repo if it doesn't exist
- Pull latest changes if it exists
- Show you the latest commit and status

## Development Workflow

### Working on Main App
```bash
# Make changes to app
git add .
git commit -m "your message"
git push origin main
```

### Testing Cross-Site Links
```powershell
# Pull latest landing page
.\sync-landing.ps1 pull

# Test locally
npm run dev
# Landing page will be in aeglyn-landing/ folder
```

### After Testing
The `aeglyn-landing/` directory is gitignored, so it won't be committed.
You can safely delete it after testing:
```powershell
Remove-Item -Recurse -Force aeglyn-landing
```

## Metadata Sync

All metadata is now synced with the landing page:
- ✅ Title: "Aeglyn | Privacy-First AI Code Security Scanner 2026"
- ✅ Favicon: Copied from landing page
- ✅ OG Image: Copied from landing page
- ✅ Manifest: Copied from landing page
- ✅ Theme Color: Aeglyn Cyan (#00d4ff)
- ✅ Keywords: Vibe coding focused
- ✅ Authors: Sai Dutta Abhishek Dash & Tejes Munde

## Assets Synced

From `aeglyn-landing/public/` to `public/`:
- `favicon.png` - Site favicon
- `og-image.png` - Social media preview image
- `manifest.json` - PWA manifest

## Deployment

Both sites deploy independently:

**Landing Page**
- Edit on different device
- Push to `aeglyn-landing-v1` repo
- Auto-deploys to `aeglyn.site`

**Main App**
- Edit on this device
- Push to `vulscany` repo
- Auto-deploys to `app.aeglyn.site`

## Benefits of This Setup

✅ **Clean Separation**: Landing page and app are completely independent
✅ **Flexible Development**: Edit landing page on any device
✅ **Easy Sync**: Pull landing page updates when needed for testing
✅ **No Conflicts**: No risk of accidentally committing landing page changes
✅ **Better Security**: Tighter control over what gets deployed where
✅ **Creative Freedom**: Envision and iterate on each part independently

---

**Quick Commands**:
- Sync landing page: `.\sync-landing.ps1 pull`
- Check status: `.\sync-landing.ps1 status`
- Commit app changes: `git add . && git commit -m "message" && git push`
