// Fix malformed imports in UI components
const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'src', 'components', 'ui');
const files = fs.readdirSync(uiDir).filter(f => f.endsWith('.jsx'));

const componentNameMap = {
  'accordion': 'AccordionPrimitive',
  'alert-dialog': 'AlertDialogPrimitive',
  'aspect-ratio': 'AspectRatioPrimitive',
  'avatar': 'AvatarPrimitive',
  'checkbox': 'CheckboxPrimitive',
  'collapsible': 'CollapsiblePrimitive',
  'context-menu': 'ContextMenuPrimitive',
  'dialog': 'DialogPrimitive',
  'dropdown-menu': 'DropdownMenuPrimitive',
  'hover-card': 'HoverCardPrimitive',
  'label': 'LabelPrimitive',
  'menubar': 'MenubarPrimitive',
  'navigation-menu': 'NavigationMenuPrimitive',
  'popover': 'PopoverPrimitive',
  'radio-group': 'RadioGroupPrimitive',
  'scroll-area': 'ScrollAreaPrimitive',
  'select': 'SelectPrimitive',
  'separator': 'SeparatorPrimitive',
  'slider': 'SliderPrimitive',
  'switch': 'SwitchPrimitive',
  'tabs': 'TabsPrimitive',
  'toast': 'ToastPrimitive',
  'toggle': 'TogglePrimitive',
  'toggle-group': 'ToggleGroupPrimitive',
  'tooltip': 'TooltipPrimitive',
  'chart': 'RechartsPrimitive',
};

files.forEach(file => {
  const filePath = path.join(uiDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const componentName = file.replace('.jsx', '');
  const primitiveName = componentNameMap[componentName] || 'ComponentPrimitive';
  
  // Fix React import
 content = content.replace(/^import \* as React from "react";[\r\n]+import \* as React from "@/, 'import * as React from "react";\nimport * as ' + primitiveName + ' from "@');
  
  // Fix standalone React from @ imports  content = content.replace(/^import \* as React from "@([^"]+)";/m, `import * as ${primitiveName} from "@$1";`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});

console.log('All files fixed!');
