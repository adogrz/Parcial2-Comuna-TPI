class NavigationLoader {
    constructor() {
        this.currentPath = window.location.pathname;
        this.isInSections = this.currentPath.includes('/sections/');
        this.init();
    }

    async init() {
        await this.loadNavigation();
        this.setActiveLink();
    }

    async loadNavigation() {
        const header = document.querySelector('header');
        if (!header) return;

        try {
            const navPath = this.isInSections ? '../components/nav.html' : 'components/nav.html';
            const response = await fetch(navPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            header.innerHTML = html;
            
            // Ajustar enlaces según la ubicación
            this.adjustLinks();
            
        } catch (error) {
            console.error('Error cargando navegación:', error);
            // Fallback: crear navegación básica
            this.createFallbackNav();
        }
    }

    adjustLinks() {
        const navLinks = document.querySelectorAll('header a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            if (this.isInSections) {
                // Estamos en /sections/, los enlaces ya están correctos
                return;
            } else {
                // Estamos en la raíz, necesitamos ajustar enlaces que no sean index.html
                if (href !== '../index.html') {
                    link.setAttribute('href', 'sections/' + href);
                } else {
                    link.setAttribute('href', 'index.html');
                }
            }
        });
    }

    setActiveLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentFile = this.getCurrentFileName();
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            const linkHref = link.getAttribute('href');
            const linkFile = this.getFileNameFromHref(linkHref);
            
            if (linkFile === currentFile) {
                link.classList.add('active');
            }
        });
    }

    getCurrentFileName() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        // Si no hay archivo específico, asumir index.html
        return fileName || 'index.html';
    }

    getFileNameFromHref(href) {
        if (href.includes('../index.html') || href === 'index.html') {
            return 'index.html';
        }
        return href.split('/').pop();
    }

    createFallbackNav() {
        const header = document.querySelector('header');
        const currentFile = this.getCurrentFileName();
        
        const navHTML = `
            <nav>
                <ul>
                    <li><a href="${this.isInSections ? '../index.html' : 'index.html'}" class="nav-link ${currentFile === 'index.html' ? 'active' : ''}">Inicio</a></li>
                    <li><a href="${this.isInSections ? 'catalog.html' : 'sections/catalog.html'}" class="nav-link ${currentFile === 'catalog.html' ? 'active' : ''}">Catálogo</a></li>
                    <li><a href="${this.isInSections ? 'rent.html' : 'sections/rent.html'}" class="nav-link ${currentFile === 'rent.html' ? 'active' : ''}">Rentar</a></li>
                    <li><a href="${this.isInSections ? 'clients.html' : 'sections/clients.html'}" class="nav-link ${currentFile === 'clients.html' ? 'active' : ''}">Clientes</a></li>
                    <li><a href="${this.isInSections ? 'about.html' : 'sections/about.html'}" class="nav-link ${currentFile === 'about.html' ? 'active' : ''}">Acerca de</a></li>
                </ul>
            </nav>
        `;
        
        header.innerHTML = navHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new NavigationLoader();
});
